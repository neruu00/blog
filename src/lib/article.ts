/**
 * @file article.ts
 * @description 기술 뉴스 원문 HTML에서 LLM 요약에 사용할 본문을 추출한다.
 */

const FETCH_TIMEOUT_MS = 12000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
// 현재 피드는 영문 기술 문서가 중심이라 36,000자는 프롬프트를 포함해 약 12,000토큰 안에 든다.
const MAX_ARTICLE_CHARS = 36000;

/** 원문 요청에 실패하거나 유효한 본문을 찾지 못하면 null을 반환한다. */
export async function fetchArticleText(url: string): Promise<string | null> {
  if (!isPublicHttpUrl(url)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let currentUrl = url;
    let response: Response | null = null;

    for (let redirects = 0; redirects <= 3; redirects += 1) {
      response = await fetch(currentUrl, {
        headers: { 'User-Agent': 'neruu00.log news curator/1.0' },
        redirect: 'manual',
        signal: controller.signal,
      });

      if (response.status < 300 || response.status >= 400) break;
      const location = response.headers.get('location');
      if (!location) return null;
      const nextUrl = new URL(location, currentUrl).toString();
      if (!isPublicHttpUrl(nextUrl)) return null;
      currentUrl = nextUrl;
      response = null;
    }

    if (!response?.ok) return null;
    if (!isPublicHttpUrl(response.url)) return null;

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) return null;

    const html = await readLimitedBody(response);
    if (!html) return null;

    const content = htmlToMarkdown(selectArticleHtml(html));
    return content.length >= 400 ? content.slice(0, MAX_ARTICLE_CHARS) : null;
  } catch (error) {
    console.warn(`[article] 원문 수집 실패: ${url}`, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function isPublicHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return false;

    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (hostname === 'localhost' || hostname.endsWith('.local')) return false;
    if (/^(127\.|10\.|192\.168\.|169\.254\.)/.test(hostname)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false;
    if (hostname === '::1' || hostname.startsWith('fc') || hostname.startsWith('fd')) return false;

    return true;
  } catch {
    return false;
  }
}

async function readLimitedBody(response: Response): Promise<string | null> {
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) return null;
  if (!response.body) return null;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function selectArticleHtml(html: string): string {
  const withoutNoise = html
    .replace(/<!--[^]*?-->/g, ' ')
    .replace(/<(script|style|svg|nav|footer|form|aside|noscript)\b[^>]*>[^]*?<\/\1>/gi, ' ');

  for (const tag of ['article', 'main']) {
    const match = withoutNoise.match(new RegExp(`<${tag}\\b[^>]*>([^]*?)<\\/${tag}>`, 'i'));
    if (match?.[1] && stripTags(match[1]).length >= 400) return match[1];
  }

  return withoutNoise.match(/<body\b[^>]*>([^]*?)<\/body>/i)?.[1] ?? withoutNoise;
}

function htmlToMarkdown(html: string): string {
  const codeBlocks: string[] = [];
  let text = html.replace(
    /<pre\b[^>]*>\s*(?:<code\b([^>]*)>)?([^]*?)(?:<\/code>)?\s*<\/pre>/gi,
    (_, attrs, code) => {
      const language = String(attrs ?? '').match(/(?:language-|lang-)([\w+-]+)/i)?.[1] ?? '';
      const value = decodeEntities(stripTags(String(code))).trim();
      const index = codeBlocks.push(`\n\n\`\`\`${language}\n${value}\n\`\`\`\n\n`) - 1;
      return `___CODE_BLOCK_${index}___`;
    },
  );

  text = text
    .replace(/<h[1-2]\b[^>]*>([^]*?)<\/h[1-2]>/gi, '\n\n## $1\n\n')
    .replace(/<h[3-6]\b[^>]*>([^]*?)<\/h[3-6]>/gi, '\n\n### $1\n\n')
    .replace(/<li\b[^>]*>([^]*?)<\/li>/gi, '\n- $1')
    .replace(/<(p|blockquote|section|div|ul|ol|table|tr)\b[^>]*>/gi, '\n')
    .replace(/<\/(p|blockquote|section|div|ul|ol|table|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<img\b[^>]*alt=["']([^"']+)["'][^>]*>/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ');

  text = decodeEntities(text)
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text.replace(/___CODE_BLOCK_(\d+)___/g, (_, index) => codeBlocks[Number(index)] ?? '');
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, ' ');
}

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(/&(#x?[\da-f]+|\w+);/gi, (entity, key: string) => {
    if (key.startsWith('#')) {
      const isHex = key[1]?.toLowerCase() === 'x';
      const point = Number.parseInt(key.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }
    return named[key.toLowerCase()] ?? entity;
  });
}

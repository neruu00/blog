/**
 * @file tiptap.ts
 * @description Tiptap JSON에서 본문 텍스트, 이미지 URL, 목차를 뽑아낸다.
 */

import type { JSONContent } from '@tiptap/react';

/** 본문에서 텍스트만 뽑는다. JSON이 아닌 문자열이 들어오면 HTML 태그를 걷어 낸다. */
export function extractTextFromTiptap(content: JSONContent | string | unknown): string {
  if (!content) return '';

  let parsedContent = content;

  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      return content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  function extract(node: Record<string, unknown>): string {
    if (!node) return '';
    let text = '';

    if (node.type === 'text' && typeof node.text === 'string') {
      text += node.text;
    }

    if (Array.isArray(node.content)) {
      node.content.forEach((child: Record<string, unknown>) => {
        text += extract(child);
      });
    }

    const blockTypes = ['paragraph', 'heading', 'codeBlock', 'listItem'];
    if (blockTypes.includes(node.type as string) && text.length > 0) {
      text += ' ';
    }

    return text;
  }

  let extractedText = '';
  if (Array.isArray(parsedContent)) {
    extractedText = parsedContent.map((node) => extract(node as Record<string, unknown>)).join('');
  } else {
    extractedText = extract(parsedContent as Record<string, unknown>);
  }

  return extractedText.replace(/\s+/g, ' ').trim();
}

/** 본문에 쓰인 이미지 URL을 모두 모은다. 게시글을 저장할 때 이미지 연결에 쓴다. */
export function extractImageUrlsFromTiptap(node: JSONContent | null | undefined): string[] {
  if (!node) return [];

  let urls: string[] = [];

  if (node.type === 'image' && node.attrs?.src) {
    urls.push(node.attrs.src as string);
  }

  if (node.content && Array.isArray(node.content)) {
    node.content.forEach((child) => {
      urls = urls.concat(extractImageUrlsFromTiptap(child));
    });
  }

  return urls;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * heading 노드로 목차 항목을 만들고, 각 항목에 앵커 id를 붙인다.
 * id에 임의 값이 섞일 수 있으므로 목차와 본문 렌더링에는 한 번 호출한 결과를 함께 써야 한다.
 */
export function extractTocFromTiptap(json: JSONContent | unknown): TocItem[] {
  if (!json || typeof json !== 'object') return [];

  const toc: TocItem[] = [];
  const idMap = new Map<string, number>();

  const traverse = (node: JSONContent) => {
    if (node.type === 'heading' && node.attrs?.level) {
      const text = node.content?.map((c) => c.text).join('') || '';
      if (text) {
        // 영문·숫자·한글만 남기고 공백은 하이픈으로 바꾼다
        let baseId = text
          .toLowerCase()
          .replace(/[^a-z0-9가-힣\s]/g, '')
          .trim()
          .replace(/\s+/g, '-');

        if (!baseId) {
          // 특수문자만 있는 제목은 남는 글자가 없어 임의 id를 쓴다
          baseId = `heading-${Math.random().toString(36).substring(2, 9)}`;
        }

        let id = baseId;
        if (idMap.has(baseId)) {
          const count = idMap.get(baseId)! + 1;
          idMap.set(baseId, count);
          id = `${baseId}-${count}`;
        } else {
          idMap.set(baseId, 0);
        }

        toc.push({ id, text, level: node.attrs.level });
      }
    }

    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  traverse(json as JSONContent);
  return toc;
}

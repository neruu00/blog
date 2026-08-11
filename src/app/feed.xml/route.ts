/**
 * @file route.ts
 * @description 블로그 자체 RSS 2.0 피드 (/feed.xml).
 *              최신 게시글 20건을 Tiptap 본문에서 추출한 요약과 함께 제공한다.
 */

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants/site';
import { supabase } from '@/lib/supabase';
import { extractTextFromTiptap } from '@/lib/utils/tiptap';

/** 1시간 캐시 — 글 발행 빈도 대비 충분하다. */
export const revalidate = 3600;

const FEED_ITEM_LIMIT = 20;
const SUMMARY_LENGTH = 300;

/** XML 예약 문자 이스케이프. 제목/본문에 &, <, > 가 들어와도 피드가 깨지지 않게 한다. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, content, created_at')
    .order('created_at', { ascending: false })
    .limit(FEED_ITEM_LIMIT);

  const items = (posts ?? [])
    .map((post) => {
      const plain = extractTextFromTiptap(post.content);
      const summary =
        plain.length > SUMMARY_LENGTH ? `${plain.slice(0, SUMMARY_LENGTH)}...` : plain;
      const link = `${SITE_URL}/posts/${post.id}`;

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(summary)}</description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

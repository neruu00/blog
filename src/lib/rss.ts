/**
 * @file rss.ts
 * @description RSS 피드 소스 상수 및 파싱 유틸리티.
 */

import Parser from 'rss-parser';

import type { TechNewsSource } from '@/types/tech-news.type';

/** RSS 피드 소스 정의 */
export const RSS_FEEDS: { source: TechNewsSource; url: string }[] = [
  {
    source: 'react',
    url: 'https://react.dev/blog/rss.xml',
  },
  {
    source: 'nextjs',
    url: 'https://nextjs.org/feed.xml',
  },
  {
    source: 'typescript',
    url: 'https://devblogs.microsoft.com/typescript/feed/',
  },
  {
    source: 'chrome',
    url: 'https://developer.chrome.com/feeds/blog.xml',
  },
  {
    source: 'tailwindcss',
    url: 'https://tailwindcss.com/feeds/blog.xml',
  },
  {
    source: 'javascript',
    url: 'https://javascriptweekly.com/rss/',
  },
];

/** RSS 아이템 파싱 결과 타입 */
export interface ParsedFeedItem {
  title: string;
  link: string;
  description: string;
  publishedAt: Date;
}

/**
 * RSS 피드 URL을 파싱하여 아이템 목록을 반환한다.
 * description은 HTML 태그를 제거한 순수 텍스트로 반환한다.
 */
export async function parseFeed(url: string): Promise<ParsedFeedItem[]> {
  const parser = new Parser({
    customFields: {
      item: ['summary', 'description'],
    },
  });

  try {
    const feed = await parser.parseURL(url);

    return feed.items
      .filter((item) => item.link && item.title)
      .map((item) => ({
        title: item.title ?? '',
        link: item.link ?? '',
        description: item.contentSnippet
          ? item.contentSnippet.trim().slice(0, 1500)
          : stripHtml(item.summary ?? item.content ?? ''),
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      }));
  } catch (error) {
    console.error(`[RSS] 피드 파싱 실패: ${url}`, error);
    return [];
  }
}

/** HTML 태그와 엔티티를 제거하고 순수 텍스트만 추출 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1500); // LLM 토큰 최소화를 위해 1500자 제한
}

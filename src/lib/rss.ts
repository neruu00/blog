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
    url: 'https://react.dev/rss.xml',
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
    url: 'https://developer.chrome.com/static/blog/feed.xml',
  },
  {
    source: 'tailwindcss',
    url: 'https://tailwindcss.com/feeds/feed.xml',
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
 * 피드 하나가 hang 하면 크론 함수 전체가 maxDuration에 걸려 죽는다.
 * rss-parser 기본 timeout이 60초이므로 명시적으로 낮춘다.
 */
const parser = new Parser({
  timeout: 15000,
  customFields: {
    item: ['summary', 'description'],
  },
});

/**
 * RSS 피드 URL을 파싱하여 아이템 목록을 반환한다.
 * description은 HTML 태그를 제거한 순수 텍스트로 반환한다.
 *
 * 파싱 실패 시 예외를 그대로 던진다. 여기서 삼키고 빈 배열을 반환하면
 * 호출부가 "기사가 없는 피드"와 "죽은 피드"를 구분하지 못해
 * 크론이 200 OK로 성공을 위장하게 된다.
 */
export async function parseFeed(url: string): Promise<ParsedFeedItem[]> {
  const feed = await parser.parseURL(url);

  return feed.items
    .filter((item) => item.link && item.title)
    .map((item) => {
      // isoDate는 rss-parser가 RSS/Atom 양쪽을 정규화한 값이라 pubDate보다 안전하다.
      const rawDate = item.isoDate ?? item.pubDate;
      const parsedDate = rawDate ? new Date(rawDate) : new Date();
      return {
        title: item.title ?? '',
        link: item.link ?? '',
        description: item.contentSnippet
          ? item.contentSnippet.trim().slice(0, 1500)
          : stripHtml(item.summary ?? item.content ?? ''),
        publishedAt: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
      };
    });
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

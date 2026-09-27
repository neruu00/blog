/**
 * @file rss.ts
 * @description 뉴스 수집 대상 RSS 피드 목록과 피드 파서.
 */

import Parser from 'rss-parser';

import type { TechNewsSource } from '@/types/tech-news.type';

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

export interface ParsedFeedItem {
  title: string;
  link: string;
  description: string;
  publishedAt: Date;
}

/**
 * 피드 하나가 응답하지 않으면 크론 전체가 maxDuration에 걸려 종료된다.
 * rss-parser의 기본 timeout은 60초라서 직접 낮춘다.
 */
const parser = new Parser({
  timeout: 15000,
  customFields: {
    item: ['summary', 'description'],
  },
});

/**
 * 피드를 파싱해 아이템 목록을 반환한다. description은 HTML을 걷어 낸 텍스트다.
 *
 * 파싱에 실패하면 예외를 그대로 던진다. 빈 배열로 삼키면 호출부가
 * "기사가 없는 피드"와 "죽은 피드"를 구분하지 못해 크론이 성공으로 응답한다.
 */
export async function parseFeed(url: string): Promise<ParsedFeedItem[]> {
  const feed = await parser.parseURL(url);

  return feed.items
    .filter((item) => item.link && item.title)
    .map((item) => {
      // isoDate는 rss-parser가 RSS/Atom 형식을 통일한 값이라 pubDate보다 믿을 만하다
      const rawDate = item.isoDate ?? item.pubDate;
      const parsedDate = rawDate ? new Date(rawDate) : new Date();
      return {
        title: item.title ?? '',
        link: item.link ?? '',
        description: item.contentSnippet
          ? item.contentSnippet.trim().slice(0, 6000)
          : stripHtml(item.summary ?? item.content ?? ''),
        publishedAt: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
      };
    });
}

/** HTML 태그와 주요 엔티티를 걷어 내고 텍스트만 남긴다. */
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
    .slice(0, 6000); // 원문을 못 가져오면 이 설명이 요약 입력이 되므로 넉넉히 남긴다
}

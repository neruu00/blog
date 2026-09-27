/**
 * @file tech-news.type.ts
 * @description 기술 뉴스 타입과 소스별 표시 이름.
 */

export type TechNewsSource =
  | 'react'
  | 'nextjs'
  | 'typescript'
  | 'chrome'
  | 'tailwindcss'
  | 'javascript';

/** `tech_news` 테이블 행 */
export interface TechNewsRow {
  id: string;
  title: string;
  original_url: string;
  content: string;
  source: TechNewsSource;
  published_at: string;
  created_at: string;
}

/** 화면에서 쓰는 뉴스 (camelCase, 날짜는 Date) */
export interface TechNews {
  id: string;
  title: string;
  originalUrl: string;
  content: string;
  source: TechNewsSource;
  publishedAt: Date;
  createdAt: Date;
}

export const TECH_NEWS_SOURCE_LABELS: Record<TechNewsSource, string> = {
  react: 'React',
  nextjs: 'Next.js',
  typescript: 'TypeScript',
  chrome: 'Chrome Dev',
  tailwindcss: 'Tailwind CSS',
  javascript: 'JavaScript',
};

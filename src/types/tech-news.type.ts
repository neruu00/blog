/**
 * @file tech-news.type.ts
 * @description 기술 뉴스 큐레이션 관련 타입 정의.
 */

/** 뉴스 소스 종류 */
export type TechNewsSource =
  | 'react'
  | 'nextjs'
  | 'typescript'
  | 'chrome'
  | 'tailwindcss'
  | 'javascript';

/** Supabase tech_news 테이블의 로우 타입 */
export interface TechNewsRow {
  id: string;
  title: string;
  original_url: string;
  content: string;
  source: TechNewsSource;
  published_at: string;
  created_at: string;
}

/** 프론트엔드에서 사용하는 뉴스 타입 */
export interface TechNews {
  id: string;
  title: string;
  originalUrl: string;
  content: string;
  source: TechNewsSource;
  publishedAt: Date;
  createdAt: Date;
}

/** 소스별 표시 레이블 */
export const TECH_NEWS_SOURCE_LABELS: Record<TechNewsSource, string> = {
  react: 'React',
  nextjs: 'Next.js',
  typescript: 'TypeScript',
  chrome: 'Chrome Dev',
  tailwindcss: 'Tailwind CSS',
  javascript: 'JavaScript',
};

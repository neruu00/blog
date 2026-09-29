/**
 * @file mappers.ts
 * @description Supabase 행(snake_case)을 도메인 타입(camelCase)으로 바꾸는 매퍼.
 */

import type { Post, PostCategory } from '@/types/post.type';
import type { TechNewsSource } from '@/types/tech-news.type';

/* Supabase 클라이언트에 DB 타입 제네릭이 없어 행 타입이 없다. 매퍼 진입점에서만 느슨하게 받는다. */
type Row = Record<string, unknown>;

/** posts 테이블 행 → Post. 시리즈 이름은 `select('*, series(title)')`로 함께 조회한 경우에만 채워진다 */
export function mapPostRow(row: Row): Post {
  const series = row.series as { title: string } | null | undefined;

  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as Post['content'],
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date((row.updated_at || row.created_at) as string),
    author: (row.author as string) || 'admin',
    tags: (row.tags as string[]) || [],
    category: ((row.category as string) || 'tech') as PostCategory,
    viewCount: (row.view_count as number) || 0,
    seriesTitle: series?.title ?? null,
  };
}

/** tech_news 목록 행(id, title, source, published_at) → 카드용 요약 */
export function mapNewsListRow(row: Row) {
  return {
    id: row.id as string,
    title: row.title as string,
    source: row.source as TechNewsSource,
    publishedAt: new Date(row.published_at as string),
  };
}

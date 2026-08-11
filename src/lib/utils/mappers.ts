/**
 * @file mappers.ts
 * @description Supabase 행(snake_case)을 도메인 타입(camelCase)으로 변환하는 공용 매퍼.
 *              홈·목록 페이지가 각자 들고 있던 동일 매핑의 단일 출처.
 */

import type { Post, PostCategory } from '@/types/post.type';
import type { TechNewsSource } from '@/types/tech-news.type';

/* Supabase 클라이언트가 제네릭 없이 생성돼 행 타입이 없다. 매퍼 경계에서 한 번만 느슨하게 받는다. */
type Row = Record<string, unknown>;

/** posts 테이블 행 → Post */
export function mapPostRow(row: Row): Post {
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
    likeCount: (row.like_count as number) || 0,
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

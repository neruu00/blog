/**
 * @file post.type.ts
 * @description 게시글 관련 타입 정의.
 */

import { JSONContent } from '@tiptap/react';

/** 게시글 카테고리 */
export type PostCategory = 'tech' | 'project' | 'portfolio' | 'etc';

/** 게시글 데이터 타입 */
export interface Post {
  /** 게시글 고유 ID (UUID) */
  id: string;
  /** 게시글 제목 */
  title: string;
  /** 게시글 본문 (Tiptap JSON) */
  content: JSONContent;
  /** 작성일 */
  createdAt: Date;
  /** 수정일 */
  updatedAt: Date;
  /** 작성자 */
  author: string;
  /** 태그 배열 */
  tags: string[];
  /** 카테고리 */
  category: PostCategory;
  /** 조회수 */
  viewCount: number;
  /** 좋아요 수 */
  likeCount: number;
}

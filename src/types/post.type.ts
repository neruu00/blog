/**
 * @file post.type.ts
 * @description 게시글 타입.
 */

import { JSONContent } from '@tiptap/react';

export type PostCategory = 'tech' | 'project' | 'etc';

export interface Post {
  /** UUID */
  id: string;
  title: string;
  /** Tiptap JSON */
  content: JSONContent;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  tags: string[];
  category: PostCategory;
  viewCount: number;
  /** 속한 시리즈 이름. 시리즈가 없거나 조회할 때 `series(title)`을 함께 받지 않았으면 null */
  seriesTitle: string | null;
}

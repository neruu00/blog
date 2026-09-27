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
}

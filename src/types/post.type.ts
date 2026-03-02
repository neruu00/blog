import { JSONContent } from '@tiptap/react';

export type Post = {
  id: string;
  title: string;
  content: JSONContent;
  createdAt: Date;
  author: string;
  tags: string[];
};

'use client';

/**
 * @file EditPostClient.tsx
 * @description 수정 페이지의 클라이언트 에디터. 조회한 글을 PostEditor 초기값으로 넘긴다.
 */

import { JSONContent } from '@tiptap/react';
import { useMemo } from 'react';

import { updatePost } from '@/actions/post';
import PostEditor from '@/components/post/PostEditor';
import type { SeriesOption } from '@/types/series.type';

interface EditPostClientProps {
  post: {
    id: string;
    title: string;
    content: JSONContent;
    tags: string[];
    seriesId: string | null;
  };
  seriesOptions: SeriesOption[];
}

export default function EditPostClient({ post, seriesOptions }: EditPostClientProps) {
  const initialData = useMemo(
    () => ({
      title: post.title,
      content: post.content,
      tags: post.tags || [],
      seriesId: post.seriesId,
    }),
    [post.title, post.content, post.tags, post.seriesId],
  );

  return (
    <PostEditor
      mode="edit"
      postId={post.id}
      initialData={initialData}
      seriesOptions={seriesOptions}
      onSubmit={updatePost}
    />
  );
}

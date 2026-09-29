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
    /** 시리즈에 속하지 않으면 빈 문자열 */
    seriesTitle: string;
    seriesOrder: number | null;
  };
  seriesOptions: SeriesOption[];
}

export default function EditPostClient({ post, seriesOptions }: EditPostClientProps) {
  const initialData = useMemo(
    () => ({
      title: post.title,
      content: post.content,
      tags: post.tags || [],
      seriesTitle: post.seriesTitle,
      seriesOrder: post.seriesOrder,
    }),
    [post.title, post.content, post.tags, post.seriesTitle, post.seriesOrder],
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

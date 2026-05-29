'use client';

import { JSONContent } from '@tiptap/react';
import { useMemo } from 'react';

import { updatePost } from '@/actions/post';
import PostEditor from '@/components/post/PostEditor';

interface EditPostClientProps {
  post: {
    id: string;
    title: string;
    content: JSONContent;
    tags: string[];
  };
}

export default function EditPostClient({ post }: EditPostClientProps) {
  const initialData = useMemo(
    () => ({
      title: post.title,
      content: post.content,
      tags: post.tags || [],
    }),
    [post.title, post.content, post.tags],
  );

  return (
    <PostEditor mode="edit" postId={post.id} initialData={initialData} onSubmit={updatePost} />
  );
}

'use client';

import { JSONContent } from '@tiptap/react';

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
  return (
    <PostEditor
      mode="edit"
      postId={post.id}
      initialData={{
        title: post.title,
        content: post.content,
        tags: post.tags || [],
      }}
      onSubmit={updatePost}
    />
  );
}

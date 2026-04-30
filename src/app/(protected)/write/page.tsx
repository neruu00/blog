'use client';

import { createPost } from '@/actions/post';
import PostEditor from '@/components/post/PostEditor';

export default function WritePage() {
  return <PostEditor mode="create" onSubmit={createPost} />;
}

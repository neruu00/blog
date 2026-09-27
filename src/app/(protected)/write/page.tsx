'use client';

/**
 * @file page.tsx
 * @description 새 게시글 작성 페이지.
 */

import { createPost } from '@/actions/post';
import PostEditor from '@/components/post/PostEditor';

export default function WritePage() {
  return <PostEditor mode="create" onSubmit={createPost} />;
}

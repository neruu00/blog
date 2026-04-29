import Link from 'next/link';

import type { Post } from '@/types/post.type';

import PostCard from './PostCard';

interface PostListProps {
  posts: Post[];
}

/**
 * 게시글 목록 컴포넌트.
 * 게시글이 없을 때 빈 상태(empty state)를 표시한다.
 */
export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-20">
        <p className="mb-2 text-gray-400">이 카테고리에 글이 없습니다.</p>
        <Link href="/write" className="text-sm font-medium text-orange-500 hover:underline">
          새 글 작성하기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

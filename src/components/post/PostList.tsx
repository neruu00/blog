import Link from 'next/link';

import EmptyState from '@/components/common/EmptyState';
import type { Post } from '@/types/post.type';

import PostCard from './PostCard';

interface PostListProps {
  posts: Post[];
  isAdmin?: boolean;
}

/**
 * 게시글 목록 컴포넌트.
 * 게시글이 없을 때 빈 상태(empty state)를 표시한다.
 */
export default function PostList({ posts, isAdmin }: PostListProps) {
  if (posts.length === 0) {
    return (
      <EmptyState message="이 카테고리에 글이 없습니다.">
        {isAdmin && (
          <Link href="/write" className="text-sm font-medium text-orange-500 hover:underline">
            새 글 작성하기 →
          </Link>
        )}
      </EmptyState>
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

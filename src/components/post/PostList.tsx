import Link from 'next/link';

import EmptyState from '@/components/common/EmptyState';
import type { Post } from '@/types/post.type';

import PostCard from './PostCard';

interface PostListProps {
  posts: Post[];
  isAdmin?: boolean;
  /** 글이 없을 때 보여줄 문구. 검색 결과가 비었을 때처럼 상황에 맞게 바꾼다 */
  emptyMessage?: string;
}

/** 게시글 목록. 글이 없으면 빈 상태를 보여준다. */
export default function PostList({
  posts,
  isAdmin,
  emptyMessage = '아직 작성된 글이 없습니다.',
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <EmptyState message={emptyMessage}>
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
        // posts 목록은 h1(PageHeader) 바로 아래라 카드 제목이 h2여야 아웃라인이 이어진다
        <PostCard key={post.id} post={post} titleAs="h2" />
      ))}
    </div>
  );
}

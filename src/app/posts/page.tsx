import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import PostCard from '@/components/PostCard';
import { mockPosts } from '@/mocks/mockPosts';

export default function PostsPage() {
  // 최신 글이 위로 오도록 정렬
  const sortedPosts = [...mockPosts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* 상단 네비게이션 & 타이틀 */}
        <header className="mb-12">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-orange-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            모든 포스트
            <span className="ml-2 text-orange-500">.</span>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-neutral-400">
            지금까지 작성한 {sortedPosts.length}개의 글을 확인해 보세요.
          </p>
        </header>

        {/* 게시글 리스트 영역 */}
        <div className="space-y-6">
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}

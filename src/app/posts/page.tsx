import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import PostCard from '@/components/PostCard';
import { supabase } from '@/lib/supabase';

export default async function PostsPage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('게시글을 불러오는 중 에러 발생:', error);
  }

  const formattedPosts = (posts || []).map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: new Date(post.created_at),
    author: post.author || 'admin',
    tags: post.tags || ['Next.js', 'Blog'],
  }));

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
            지금까지 작성한 {formattedPosts.length}개의 글을 확인해 보세요.
          </p>
        </header>

        {/* 게시글 리스트 영역 */}
        <div className="space-y-6">
          {formattedPosts.length > 0 ? (
            formattedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            // 🔥 게시글이 하나도 없을 때를 대비한 텅 빈 상태(Empty State) UI
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-neutral-400">
              <p className="mb-4 text-lg">아직 작성된 게시글이 없습니다.</p>
              <Link href="/write" className="text-sm font-medium text-orange-500 hover:underline">
                첫 번째 글 작성하러 가기 ✍️
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

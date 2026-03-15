import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import PostCard from '@/components/PostCard';
import { supabase } from '@/lib/supabase';

const TAG_DICTIONARY = [
  { name: 'Algorithm', keywords: ['알고리즘'] },
  { name: 'Frontend', keywords: ['프론트엔드', '프론트', 'fe'] },
  { name: 'Backend', keywords: ['백엔드', 'be'] },
  { name: 'Database', keywords: ['데이터베이스', 'db'] },
  { name: 'Javascript', keywords: ['자바스크립트', 'js'] },
  { name: 'Typescript', keywords: ['타입스크립트', 'ts'] },
  { name: 'React', keywords: ['리액트'] },
  { name: 'Next.js', keywords: ['넥스트'] },
  { name: 'Java', keywords: ['자바'] },
  { name: 'Python', keywords: ['파이썬'] },
  { name: 'etc', keywords: ['기타'] },
];

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const resolveSearchParams = await searchParams; // 기본값은 전체(All)
  const currentTag = resolveSearchParams.tag || 'All';

  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });

  if (currentTag !== 'All') {
    query = query.contains('tags', [currentTag]);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error('게시글을 불러오는 중 에러 발생:', error);
  }

  const formattedPosts = (posts || []).map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: new Date(post.created_at),
    author: post.author || 'admin',
    tags: post.tags || [],
  }));

  const categories = ['All', ...TAG_DICTIONARY.map((t) => t.name)];

  return (
    <main className="relative min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* 상단 네비게이션 & 타이틀 */}
        <header className="mb-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-orange-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {currentTag === 'All' ? '모든 포스트' : `${currentTag} 포스트`}
            <span className="ml-2 text-orange-500">.</span>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-neutral-400">
            총 {formattedPosts.length}개의 글이 있습니다.
          </p>
        </header>

        {/* 💡 4. 카테고리(태그) 필터 네비게이션 */}
        <nav className="mb-10 flex flex-wrap gap-2">
          {categories.map((tag) => {
            const isActive = currentTag === tag;
            return (
              <Link
                key={tag}
                // 'All'을 누르면 쿼리 파라미터를 지우고 기본 주소로 이동합니다.
                href={tag === 'All' ? '/posts' : `/posts?tag=${tag}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700 dark:hover:text-orange-400'
                }`}
              >
                {tag}
              </Link>
            );
          })}
        </nav>

        {/* 게시글 리스트 영역 */}
        <div className="space-y-6">
          {formattedPosts.length > 0 ? (
            formattedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-neutral-400">
              <p className="mb-4 text-lg">해당 카테고리에 작성된 게시글이 없습니다.</p>
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

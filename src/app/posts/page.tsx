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
    <main className="font-sans relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* 상단 네비게이션 & 타이틀 */}
        <header className="mb-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-xl font-marker text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="font-marker text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {currentTag === 'All' ? 'ALL POSTS' : `${currentTag.toUpperCase()} POSTS`}
            <span className="ml-2 text-brand">.</span>
          </h1>
          <p className="mt-4 font-marker text-xl text-slate-500 dark:text-neutral-400">
            Total {formattedPosts.length} posts available.
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
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors border-2 ${
                  isActive
                    ? 'bg-brand border-brand text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand hover:text-brand dark:bg-neutral-800 dark:text-slate-300 dark:border-neutral-700 dark:hover:border-brand'
                }`}
              >
                {tag}
              </Link>
            );
          })}
        </nav>

        {/* 게시글 리스트 영역 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {formattedPosts.length > 0 ? (
            formattedPosts.map((post, index) => <PostCard key={post.id} post={post} index={index} />)
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 dark:text-neutral-400 relative bg-yellow-50 dark:bg-yellow-900/20 shadow-md p-8 transform rotate-1 rounded-sm w-full max-w-md mx-auto">
               <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 rounded-full bg-red-400 shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-white/40 z-10"></div>
              <p className="mb-4 text-2xl font-marker font-bold text-slate-800 dark:text-white">No posts in this category.</p>
              <Link href="/write" className="text-xl font-marker text-brand hover:underline">
                Write a new post ✍️
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

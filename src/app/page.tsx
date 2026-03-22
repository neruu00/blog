import { Github, Mail } from 'lucide-react';
import Link from 'next/link';

import IDCard from '@/components/IDCard';
import PostCard from '@/components/PostCard';
import Tooltip from '@/components/Tooltip';
import { supabase } from '@/lib/supabase';

export default async function HomePage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('게시글을 불러오는 중 에러 발생:', error);
  }

  // 3. PostCard 컴포넌트의 props 규격에 맞게 데이터 가공
  const formattedPosts = (posts || []).map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: new Date(post.created_at),
    author: post.author || 'admin',
    tags: post.tags || ['Next.js', 'Blog'],
  }));

  return (
    <main className="relative min-h-screen overflow-hidden font-sans text-slate-800 dark:text-slate-200">
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <header className="mb-16 flex items-center justify-center">
          <h1 className="font-marker text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            .Blog
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
          <IDCard />

          {/* 우측 메인 영역 (최신 게시물) */}
          <section className="lg:col-span-2">
            <div className="mb-10 flex items-center justify-between border-b-4 border-slate-100 pb-4 dark:border-slate-800">
              <h2 className="font-marker relative text-5xl font-extrabold text-gray-900 dark:text-white">
                LATEST LOGS
                <span className="bg-brand absolute -bottom-[20px] left-0 h-1 w-1/2"></span>
              </h2>
              <Link
                href="/posts"
                className="font-marker text-brand hover:bg-brand flex items-center gap-1 rounded-full px-4 py-1 text-2xl font-bold tracking-wide transition-colors hover:text-white"
              >
                VIEW ALL POSTS
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {formattedPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

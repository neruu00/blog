import Link from 'next/link';

import IDCard from '@/components/IDCard';
import PostCard from '@/components/PostCard';
import { supabase } from '@/lib/supabase';

export default async function HomePage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

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
            <div className="mb-10 flex items-center justify-between">
              <h2 className="font-marker relative text-5xl font-extrabold text-gray-900 dark:text-white">
                LATEST LOGS
              </h2>
              <Link
                href="/posts"
                className="group font-marker text-brand relative inline-flex items-center px-2 py-1 text-2xl font-bold tracking-wide transition-colors"
                title="View All Posts"
              >
                <span className="relative z-10">VIEW ALL POSTS</span>
                <span className="bg-brand absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
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

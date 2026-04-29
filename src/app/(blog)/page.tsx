/**
 * @file page.tsx
 * @description 블로그 홈페이지.
 *              프로필 인사말과 최신 게시글 목록을 표시한다.
 *              velog 스타일의 화이트 모던 디자인.
 */

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import PostCard from '@/components/post/PostCard';
import { supabase } from '@/lib/supabase';

export default async function HomePage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('게시글을 불러오는 중 에러 발생:', error);
  }

  // PostCard props 규격에 맞게 데이터 가공
  const formattedPosts = (posts || []).map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: new Date(post.created_at),
    updatedAt: new Date(post.updated_at || post.created_at),
    author: post.author || 'admin',
    tags: post.tags || [],
    category: post.category || 'tech',
    viewCount: post.view_count || 0,
    likeCount: post.like_count || 0,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      {/* 인사말 섹션 */}
      <section className="mb-16">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">안녕하세요 👋</h1>
        <p className="text-lg leading-relaxed text-gray-500">
          개발하며 배운 것들을 기록하는 블로그입니다.
        </p>
      </section>

      {/* 최신 게시글 */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">최신 글</h2>
          <Link
            href="/posts"
            className="group flex items-center gap-1 text-sm font-medium text-gray-400 transition-colors hover:text-orange-500"
          >
            전체 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {formattedPosts.length > 0 ? (
          <div className="flex flex-col divide-y divide-gray-100">
            {formattedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-20">
            <p className="text-gray-400">아직 작성된 글이 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}

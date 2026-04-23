/**
 * @file page.tsx
 * @description 게시글 목록 페이지.
 *              태그(카테고리) 필터링과 전체 게시글 리스트를 표시한다.
 */

import Link from 'next/link';

import PostCard from '@/components/post/PostCard';
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
  const resolveSearchParams = await searchParams;
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
    updatedAt: new Date(post.updated_at || post.created_at),
    author: post.author || 'admin',
    tags: post.tags || [],
    category: post.category || 'tech',
    viewCount: post.view_count || 0,
    likeCount: post.like_count || 0,
  }));

  const categories = ['All', ...TAG_DICTIONARY.map((t) => t.name)];

  return (
    <div className="mx-auto max-w-3xl">
      {/* 헤더 */}
      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
          {currentTag === 'All' ? '전체 글' : currentTag}
        </h1>
        <p className="text-sm text-gray-400">총 {formattedPosts.length}개의 글</p>
      </header>

      {/* 태그 필터 */}
      <nav className="mb-10 flex flex-wrap gap-2">
        {categories.map((tag) => {
          const isActive = currentTag === tag;
          return (
            <Link
              key={tag}
              href={tag === 'All' ? '/posts' : `/posts?tag=${tag}`}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'
              }`}
            >
              {tag}
            </Link>
          );
        })}
      </nav>

      {/* 게시글 리스트 */}
      {formattedPosts.length > 0 ? (
        <div className="flex flex-col divide-y divide-gray-100">
          {formattedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-20">
          <p className="mb-2 text-gray-400">이 카테고리에 글이 없습니다.</p>
          <Link href="/write" className="text-sm font-medium text-orange-500 hover:underline">
            새 글 작성하기 →
          </Link>
        </div>
      )}
    </div>
  );
}

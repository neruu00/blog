/**
 * @file page.tsx
 * @description 게시글 목록 페이지.
 *              태그(카테고리) 필터링과 전체 게시글 리스트를 표시한다.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';

import Pagination from '@/components/common/Pagination';
import PostList from '@/components/post/PostList';
import { supabase } from '@/lib/supabase';
import type { PostCategory } from '@/types/post.type';

const POSTS_PER_PAGE = 10;

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
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const resolveSearchParams = await searchParams;
  const currentTag = resolveSearchParams.tag || 'All';

  // 페이지 파라미터 유효성 검사 및 리다이렉트
  const rawPage = resolveSearchParams.page;
  const parsedPage = parseInt(rawPage || '1', 10);

  if (rawPage && (isNaN(parsedPage) || parsedPage < 1)) {
    const params = new URLSearchParams();
    if (currentTag !== 'All') params.set('tag', currentTag);
    // 잘못된 페이지가 입력되면 해당 파라미터를 제거하고 1페이지로 리다이렉트
    const queryString = params.toString();
    redirect(queryString ? `/posts?${queryString}` : '/posts');
  }

  const currentPage = Math.max(1, parsedPage || 1);

  // 페이지 범위 계산
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (currentTag !== 'All') {
    query = query.contains('tags', [currentTag]);
  }

  const { data: posts, error, count } = await query;

  if (error) {
    console.error('게시글을 불러오는 중 에러 발생:', error);
  }

  const totalPosts = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  // 최대 페이지 범위를 초과할 경우 마지막 페이지로 리다이렉트
  if (currentPage > totalPages && totalPosts > 0) {
    const params = new URLSearchParams();
    if (currentTag !== 'All') params.set('tag', currentTag);
    params.set('page', totalPages.toString());
    redirect(`/posts?${params.toString()}`);
  }

  const formattedPosts = (posts || []).map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: new Date(post.created_at),
    updatedAt: new Date(post.updated_at || post.created_at),
    author: post.author || 'admin',
    tags: post.tags || [],
    category: (post.category || 'tech') as PostCategory,
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
        <p className="text-sm text-gray-400">총 {totalPosts}개의 글</p>
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
      <PostList posts={formattedPosts} />

      {/* 페이지네이션 */}
      <Pagination currentPage={currentPage} totalPages={totalPages} currentTag={currentTag} />
    </div>
  );
}

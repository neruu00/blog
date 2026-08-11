/**
 * @file page.tsx
 * @description 게시글 목록 페이지.
 *              태그(카테고리) 필터링과 전체 게시글 리스트를 표시한다.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';

import Pagination from '@/components/common/Pagination';
import PostList from '@/components/post/PostList';
import { isAdmin as checkIsAdmin } from '@/lib/auth';
import { POSTS_PER_PAGE, TAG_DICTIONARY } from '@/lib/constants/tags';
import { supabase } from '@/lib/supabase';
import { mapPostRow } from '@/lib/utils/mappers';

/**
 * 이 페이지는 동적 렌더링으로 남긴다:
 * - 태그 필터·페이지네이션이 `searchParams`를 읽는다 (force-static 시 빈 객체가 됨)
 * - `isAdmin()`이 세션 쿠키를 읽는다
 * ISR 전환은 PLAN.md T-203 참조 (관리자 UI를 클라이언트 세션으로 옮기면 가능)
 */
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

  const isAdmin = await checkIsAdmin();

  const formattedPosts = (posts || []).map(mapPostRow);

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
      <PostList posts={formattedPosts} isAdmin={isAdmin} />

      {/* 페이지네이션 */}
      <Pagination currentPage={currentPage} totalPages={totalPages} currentTag={currentTag} />
    </div>
  );
}

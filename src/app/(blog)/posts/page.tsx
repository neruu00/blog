/**
 * @file page.tsx
 * @description 게시글 목록 페이지. 검색 버튼(PostSearch)과 `?q=` 전체 검색 결과, 페이지네이션을 제공한다.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';

import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import PostList from '@/components/post/PostList';
import PostSearch from '@/components/post/PostSearch';
import { isAdmin as checkIsAdmin } from '@/lib/auth';
import { POSTS_PER_PAGE } from '@/lib/constants/tags';
import { supabase } from '@/lib/supabase';
import { mapPostRow } from '@/lib/utils/mappers';
import { buildPostSearchFilter } from '@/lib/utils/postSearch';
import { postSearchQuerySchema } from '@/schemas/search.schema';

/**
 * 동적 렌더링을 유지한다. 검색어와 페이지네이션이 `searchParams`를 읽고(force-static이면 빈 객체가 된다)
 * `isAdmin()`이 세션 쿠키를 읽기 때문이다.
 */
export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolveSearchParams = await searchParams;
  const searchQuery = postSearchQuerySchema.parse(resolveSearchParams.q ?? '');

  const withSearch = (params: URLSearchParams) => {
    if (searchQuery) params.set('q', searchQuery);
    return params;
  };

  const rawPage = resolveSearchParams.page;
  const parsedPage = parseInt(rawPage || '1', 10);

  if (rawPage && (isNaN(parsedPage) || parsedPage < 1)) {
    const queryString = withSearch(new URLSearchParams()).toString();
    redirect(queryString ? `/posts?${queryString}` : '/posts');
  }

  const currentPage = Math.max(1, parsedPage || 1);

  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  let query = supabase
    .from('posts')
    .select('*, series(title)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (searchQuery) {
    query = query.or(buildPostSearchFilter(searchQuery));
  }

  const { data: posts, error, count } = await query;

  if (error) {
    console.error('게시글을 불러오는 중 에러 발생:', error);
  }

  const totalPosts = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  if (currentPage > totalPages && totalPosts > 0) {
    const params = withSearch(new URLSearchParams());
    params.set('page', totalPages.toString());
    redirect(`/posts?${params.toString()}`);
  }

  const isAdmin = await checkIsAdmin();

  const formattedPosts = (posts || []).map(mapPostRow);

  return (
    <div>
      <PageHeader
        title={searchQuery ? `‘${searchQuery}’ 검색 결과` : '전체 글'}
        titleAside={
          <div className="ml-auto self-center">
            <PostSearch initialQuery={searchQuery} />
          </div>
        }
        description={`총 ${totalPosts}개의 글`}
      >
        {searchQuery && (
          <Link
            href="/posts"
            className="mt-2 inline-block text-sm font-medium text-orange-500 hover:underline"
          >
            검색 지우고 전체 글 보기
          </Link>
        )}
      </PageHeader>

      <PostList
        posts={formattedPosts}
        isAdmin={isAdmin}
        emptyMessage={searchQuery ? '검색 결과가 없습니다.' : undefined}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/posts"
        params={searchQuery ? { q: searchQuery } : undefined}
      />
    </div>
  );
}

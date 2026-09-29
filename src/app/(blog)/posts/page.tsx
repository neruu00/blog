/**
 * @file page.tsx
 * @description 게시글 목록 페이지. 태그 필터와 페이지네이션을 제공한다.
 */

import { redirect } from 'next/navigation';

import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import PostList from '@/components/post/PostList';
import FilterChip from '@/components/ui/FilterChip';
import { isAdmin as checkIsAdmin } from '@/lib/auth';
import { POSTS_PER_PAGE, TAG_DICTIONARY } from '@/lib/constants/tags';
import { supabase } from '@/lib/supabase';
import { mapPostRow } from '@/lib/utils/mappers';

/**
 * 동적 렌더링을 유지한다. 태그 필터와 페이지네이션이 `searchParams`를 읽고(force-static이면 빈 객체가 된다)
 * `isAdmin()`이 세션 쿠키를 읽기 때문이다.
 */
export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const resolveSearchParams = await searchParams;
  const currentTag = resolveSearchParams.tag || 'All';

  const rawPage = resolveSearchParams.page;
  const parsedPage = parseInt(rawPage || '1', 10);

  if (rawPage && (isNaN(parsedPage) || parsedPage < 1)) {
    const params = new URLSearchParams();
    if (currentTag !== 'All') params.set('tag', currentTag);
    const queryString = params.toString();
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

  if (currentTag !== 'All') {
    query = query.contains('tags', [currentTag]);
  }

  const { data: posts, error, count } = await query;

  if (error) {
    console.error('게시글을 불러오는 중 에러 발생:', error);
  }

  const totalPosts = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

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
      <PageHeader
        title={currentTag === 'All' ? '전체 글' : currentTag}
        description={`총 ${totalPosts}개의 글`}
      />

      <nav className="mb-10 flex flex-wrap gap-2">
        {categories.map((tag) => (
          <FilterChip
            key={tag}
            href={tag === 'All' ? '/posts' : `/posts?tag=${tag}`}
            active={currentTag === tag}
          >
            {tag}
          </FilterChip>
        ))}
      </nav>

      <PostList posts={formattedPosts} isAdmin={isAdmin} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/posts"
        params={currentTag !== 'All' ? { tag: currentTag } : undefined}
      />
    </div>
  );
}

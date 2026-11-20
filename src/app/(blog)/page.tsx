/**
 * @file page.tsx
 * @description 블로그 홈. 최신 기술 뉴스와 최신 게시글을 보여준다.
 */

import EmptyState from '@/components/common/EmptyState';
import SectionHeader from '@/components/common/SectionHeader';
import NewsCard from '@/components/news/NewsCard';
import PostCard from '@/components/post/PostCard';
import { supabase } from '@/lib/supabase';
import { mapNewsListRow, mapPostRow } from '@/lib/utils/mappers';

/**
 * 5분 ISR. supabase-js의 fetch에는 캐시 옵션이 없어 revalidate만으로는 동적 라우트로 남으므로
 * force-static으로 캐싱을 강제해야 한다.
 */
export const dynamic = 'force-static';
export const revalidate = 300;

export default async function HomePage() {
  const [{ data: posts, error: postsError }, { data: newsRows, error: newsError }] =
    await Promise.all([
      supabase
        .from('posts')
        .select('*, series(title)')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('tech_news')
        .select('id, title, source, published_at')
        .order('published_at', { ascending: false })
        .limit(3),
    ]);

  if (postsError) {
    console.error('게시글을 불러오는 중 에러 발생:', postsError);
    throw new Error('게시글을 불러오는 중 오류가 발생했습니다.');
  }
  if (newsError) {
    console.error('뉴스를 불러오는 중 에러 발생:', newsError);
    throw new Error('뉴스를 불러오는 중 오류가 발생했습니다.');
  }

  const formattedPosts = (posts || []).map(mapPostRow);
  const newsList = (newsRows ?? []).map(mapNewsListRow);

  return (
    <div>
      {/* 화면에 제목을 두지 않고 문서 아웃라인용 h1만 둔다 */}
      <h1 className="sr-only">neruu00.log</h1>

      <section className="mb-16">
        <SectionHeader title="최신 기술 뉴스" href="/news" />

        {newsList.length > 0 ? (
          <div className="flex flex-col divide-y divide-gray-100">
            {newsList.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        ) : (
          <EmptyState message="뉴스가 아직 수집되지 않았습니다.">
            <p className="text-sm text-gray-400">새 뉴스가 수집되면 자동으로 표시됩니다.</p>
          </EmptyState>
        )}
      </section>

      <section>
        <SectionHeader title="최신 글" href="/posts" />

        {formattedPosts.length > 0 ? (
          <div className="flex flex-col divide-y divide-gray-100">
            {formattedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState message="아직 작성된 글이 없습니다." />
        )}
      </section>
    </div>
  );
}

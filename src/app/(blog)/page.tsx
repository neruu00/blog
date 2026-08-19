/**
 * @file page.tsx
 * @description 블로그 홈페이지.
 *              인사말, 마우스 커서 트래킹 눈동자 포스터 및 빈 포스터 영역,
 *              최신 기술 뉴스(5개), 최신 게시글을 표시한다.
 */

import EmptyState from '@/components/common/EmptyState';
import SectionHeader from '@/components/common/SectionHeader';
import EyePoster from '@/components/layout/EyePoster';
import TechStackPoster from '@/components/layout/TechStackPoster';
import NewsCard from '@/components/news/NewsCard';
import PostCard from '@/components/post/PostCard';
import { supabase } from '@/lib/supabase';
import { mapNewsListRow, mapPostRow } from '@/lib/utils/mappers';

/**
 * 세션·쿠키 의존이 없어 정적 재생성이 가능하다. 5분 ISR —
 * 새 글/뉴스는 최대 5분 지연으로 반영되고, 그동안 DB 조회가 발생하지 않는다.
 * supabase-js의 내부 fetch는 캐시 옵션이 없어 그대로 두면 라우트가 동적으로
 * 남기 때문에 force-static으로 fetch 캐싱까지 강제해야 revalidate가 동작한다.
 */
export const dynamic = 'force-static';
export const revalidate = 300;

export default async function HomePage() {
  const [{ data: posts, error: postsError }, { data: newsRows, error: newsError }] =
    await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(6),
      supabase
        .from('tech_news')
        .select('id, title, source, published_at')
        .order('published_at', { ascending: false })
        .limit(5),
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
    <div className="mx-auto max-w-5xl">
      {/* 1. 인사말 — 방범카메라 포스터(作動中)와 같은 톤의 "기록 중" 컨셉 */}
      <section className="mb-12">
        <h1 className="mb-3 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
          기록 작동 중{/* REC 인디케이터 — 녹화 표시등은 관례상 빨강 (상태색 red-500와 동일 값) */}
          <span
            className="inline-block h-3 w-3 animate-pulse rounded-full bg-red-500"
            aria-hidden
          />
        </h1>
        <p className="text-lg leading-relaxed text-gray-500">
          개발하며 배운 것들이 사라지기 전에 이곳에 남깁니다.
        </p>
      </section>

      {/* 2. 포스터(1/5 + 1/5) + 최신 뉴스(3/5) 섹션
          포스터는 마우스 전용 인터랙션이라 터치 기기에선 정지 이미지일 뿐이고,
          모바일에서 콘텐츠보다 먼저 500px+를 차지하므로 md 미만에서는 숨긴다 */}
      <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* 눈동자 포스터 */}
        <div className="hidden md:col-span-1 md:block">
          <EyePoster />
        </div>

        {/* 기술 스택 무한 루프 */}
        <div className="hidden md:col-span-1 md:block">
          <TechStackPoster />
        </div>

        {/* 최신 기술 뉴스 */}
        <div className="md:col-span-3">
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
        </div>
      </section>

      {/* 3. 최신 글 섹션 */}
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

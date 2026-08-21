/**
 * @file page.tsx
 * @description 기술 뉴스 전체 목록 페이지.
 *              소스별 필터 탭과 뉴스 카드 리스트를 표시한다.
 *              Server Component — Supabase에서 직접 데이터를 가져온다.
 */

import { redirect } from 'next/navigation';

import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import NewsCard from '@/components/news/NewsCard';
import FilterChip from '@/components/ui/FilterChip';
import { supabase } from '@/lib/supabase';
import { mapNewsListRow } from '@/lib/utils/mappers';
import { TECH_NEWS_SOURCE_LABELS, type TechNewsSource } from '@/types/tech-news.type';

export const metadata = {
  title: '기술 뉴스 | neruu00.log',
  description: '프론트엔드 최신 소식과 한국어 요약을 제공합니다.',
};

/**
 * 이 페이지는 동적 렌더링으로 남긴다: 소스 필터가 `searchParams`를 읽는데,
 * force-static은 searchParams를 빈 객체로 만들어 필터가 깨진다.
 * (cushion blog/PLAN.md T-203 — 필터를 경로 세그먼트로 옮기면 ISR 전환 가능)
 */

const ALL_SOURCES = Object.keys(TECH_NEWS_SOURCE_LABELS) as TechNewsSource[];

const NEWS_PER_PAGE = 20;

interface NewsPageProps {
  searchParams: Promise<{ source?: string; page?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { source, page } = await searchParams;
  const activeSource = ALL_SOURCES.includes(source as TechNewsSource)
    ? (source as TechNewsSource)
    : null;

  // 잘못된 페이지 파라미터는 제거하고 1페이지로 (posts 목록과 같은 패턴)
  const parsedPage = parseInt(page || '1', 10);
  if (page && (isNaN(parsedPage) || parsedPage < 1)) {
    redirect(activeSource ? `/news?source=${activeSource}` : '/news');
  }
  const currentPage = Math.max(1, parsedPage || 1);

  const from = (currentPage - 1) * NEWS_PER_PAGE;
  const to = from + NEWS_PER_PAGE - 1;

  // 선택된 소스 또는 전체 뉴스 조회
  let query = supabase
    .from('tech_news')
    .select('id, title, source, published_at', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to);

  if (activeSource) {
    query = query.eq('source', activeSource);
  }

  const { data: rows, error, count } = await query;

  // 범위를 벗어난 페이지 요청도 error로 오므로(PGRST103) 던지지 않고
  // 아래의 마지막 페이지 리다이렉트로 처리한다 — posts 목록과 같은 방식
  if (error) {
    console.error('[news] 뉴스 목록 조회 실패:', error);
  }

  const totalNews = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalNews / NEWS_PER_PAGE));

  // 최대 페이지를 초과하면 마지막 페이지로 리다이렉트
  if (currentPage > totalPages && totalNews > 0) {
    const params = new URLSearchParams();
    if (activeSource) params.set('source', activeSource);
    params.set('page', totalPages.toString());
    redirect(`/news?${params.toString()}`);
  }

  const newsList = (rows ?? []).map(mapNewsListRow);

  return (
    <div className="mx-auto max-w-3xl">
      {/* 페이지 헤더 */}
      <PageHeader
        title="기술 뉴스"
        description="프론트엔드 최신 소식과 한국어 요약을 제공합니다."
      />

      {/* 소스 필터 탭 */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          <FilterChip href="/news" active={!activeSource}>
            전체
          </FilterChip>
          {ALL_SOURCES.map((src) => (
            <FilterChip key={src} href={`/news?source=${src}`} active={activeSource === src}>
              {TECH_NEWS_SOURCE_LABELS[src]}
            </FilterChip>
          ))}
        </div>
      </section>

      {/* 뉴스 목록 */}
      <section>
        {newsList.length > 0 ? (
          <div className="flex flex-col divide-y divide-gray-100">
            {newsList.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        ) : (
          <EmptyState
            message={
              activeSource
                ? `${TECH_NEWS_SOURCE_LABELS[activeSource]} 뉴스가 아직 없습니다.`
                : '아직 수집된 뉴스가 없습니다. 새 뉴스가 수집되면 자동으로 표시됩니다.'
            }
          />
        )}
      </section>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/news"
        params={activeSource ? { source: activeSource } : undefined}
      />
    </div>
  );
}

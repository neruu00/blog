/**
 * @file page.tsx
 * @description 기술 뉴스 목록 페이지. 소스 필터와 페이지네이션을 제공한다.
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
 * 동적 렌더링을 유지한다. force-static이면 `searchParams`가 빈 객체가 되어 소스 필터가 깨진다.
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

  const parsedPage = parseInt(page || '1', 10);
  if (page && (isNaN(parsedPage) || parsedPage < 1)) {
    redirect(activeSource ? `/news?source=${activeSource}` : '/news');
  }
  const currentPage = Math.max(1, parsedPage || 1);

  const from = (currentPage - 1) * NEWS_PER_PAGE;
  const to = from + NEWS_PER_PAGE - 1;

  let query = supabase
    .from('tech_news')
    .select('id, title, source, published_at', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to);

  if (activeSource) {
    query = query.eq('source', activeSource);
  }

  const { data: rows, error, count } = await query;

  // 범위를 벗어난 페이지도 error(PGRST103)로 오므로 던지지 않고 아래 마지막 페이지 리다이렉트로 넘긴다.
  if (error) {
    console.error('[news] 뉴스 목록 조회 실패:', error);
  }

  const totalNews = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalNews / NEWS_PER_PAGE));

  if (currentPage > totalPages && totalNews > 0) {
    const params = new URLSearchParams();
    if (activeSource) params.set('source', activeSource);
    params.set('page', totalPages.toString());
    redirect(`/news?${params.toString()}`);
  }

  const newsList = (rows ?? []).map(mapNewsListRow);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="기술 뉴스"
        description="프론트엔드 최신 소식과 한국어 요약을 제공합니다."
      />

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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/news"
        params={activeSource ? { source: activeSource } : undefined}
      />
    </div>
  );
}

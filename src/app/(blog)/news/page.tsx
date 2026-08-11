/**
 * @file page.tsx
 * @description 기술 뉴스 전체 목록 페이지.
 *              소스별 필터 탭과 뉴스 카드 리스트를 표시한다.
 *              Server Component — Supabase에서 직접 데이터를 가져온다.
 */

import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
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
 * (PLAN.md T-203 — 필터를 경로 세그먼트로 옮기면 ISR 전환 가능)
 */

const ALL_SOURCES = Object.keys(TECH_NEWS_SOURCE_LABELS) as TechNewsSource[];

interface NewsPageProps {
  searchParams: Promise<{ source?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { source } = await searchParams;
  const activeSource = ALL_SOURCES.includes(source as TechNewsSource)
    ? (source as TechNewsSource)
    : null;

  // 선택된 소스 또는 전체 뉴스 조회
  let query = supabase
    .from('tech_news')
    .select('id, title, source, published_at')
    .order('published_at', { ascending: false })
    .limit(50);

  if (activeSource) {
    query = query.eq('source', activeSource);
  }

  const { data: rows, error } = await query;

  if (error) {
    console.error('[news] 뉴스 목록 조회 실패:', error);
    throw new Error('뉴스 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
                : '수집된 뉴스가 없습니다. Cron Job이 실행되면 자동으로 채워집니다.'
            }
          />
        )}
      </section>
    </div>
  );
}

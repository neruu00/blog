/**
 * @file page.tsx
 * @description 기술 뉴스 전체 목록 페이지.
 *              소스별 필터 탭과 뉴스 카드 리스트를 표시한다.
 *              Server Component — Supabase에서 직접 데이터를 가져온다.
 */

import Link from 'next/link';

import NewsCard from '@/components/news/NewsCard';
import { supabase } from '@/lib/supabase';
import {
  TECH_NEWS_SOURCE_LABELS,
  type TechNews,
  type TechNewsSource,
} from '@/types/tech-news.type';

export const metadata = {
  title: '기술 뉴스 | neruu00.log',
  description: '프론트엔드 최신 소식과 한국어 요약을 제공합니다.',
};

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
    .select('*')
    .order('published_at', { ascending: false })
    .limit(50);

  if (activeSource) {
    query = query.eq('source', activeSource);
  }

  const { data: rows, error } = await query;

  if (error) {
    console.error('[news] 뉴스 목록 조회 실패:', error);
  }

  const newsList: TechNews[] = (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    originalUrl: row.original_url,
    content: row.content,
    source: row.source as TechNewsSource,
    publishedAt: new Date(row.published_at),
    createdAt: new Date(row.created_at),
  }));

  return (
    <div className="mx-auto max-w-3xl">
      {/* 페이지 헤더 */}
      <section className="mb-10">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">기술 뉴스</h1>
        <p className="text-base leading-relaxed text-gray-500">
          프론트엔드 최신 소식과 한국어 요약을 제공합니다.
        </p>
      </section>

      {/* 소스 필터 탭 */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/news"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !activeSource
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </Link>
          {ALL_SOURCES.map((src) => (
            <Link
              key={src}
              href={`/news?source=${src}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeSource === src
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {TECH_NEWS_SOURCE_LABELS[src]}
            </Link>
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-20">
            <p className="text-gray-400">
              {activeSource
                ? `${TECH_NEWS_SOURCE_LABELS[activeSource]} 뉴스가 아직 없습니다.`
                : '수집된 뉴스가 없습니다. Cron Job이 실행되면 자동으로 채워집니다.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

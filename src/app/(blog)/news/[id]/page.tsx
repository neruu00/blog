/**
 * @file page.tsx
 * @description 기술 뉴스 상세 페이지.
 *              Supabase에서 뉴스 데이터를 가져와 마크다운 요약을 렌더링한다.
 *              Chrome Dev 기사의 경우 한국어 버전 링크를 함께 제공한다.
 */

import { notFound } from 'next/navigation';

import BackLink from '@/components/common/BackLink';
import NewsContent from '@/components/news/NewsContent';
import NewsSourceCard from '@/components/news/NewsSourceCard';
import TagBadge from '@/components/ui/TagBadge';
import { supabase } from '@/lib/supabase';
import { formatDateKo } from '@/lib/utils/date';
import { TECH_NEWS_SOURCE_LABELS } from '@/types/tech-news.type';
import type { TechNews, TechNewsSource } from '@/types/tech-news.type';

import type { Metadata } from 'next';

interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 세션·쿠키 의존 없음 — 요약 본문은 수집 후 불변이므로 5분 ISR로 충분하다.
 * supabase-js fetch가 캐시 옵션 없이 나가므로 force-static으로 캐싱을 강제한다.
 */
export const dynamic = 'force-static';
export const revalidate = 300;

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from('tech_news').select('title, source').eq('id', id).single();

  if (!data) return { title: '뉴스를 찾을 수 없습니다.' };

  return {
    title: `${data.title} | neruu00.log`,
    description: `${TECH_NEWS_SOURCE_LABELS[data.source as TechNewsSource]} 기술 뉴스 요약`,
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params;

  const { data: row, error } = await supabase.from('tech_news').select('*').eq('id', id).single();

  if (error || !row) {
    notFound();
  }

  const news: TechNews = {
    id: row.id,
    title: row.title,
    originalUrl: row.original_url,
    content: row.content,
    source: row.source as TechNewsSource,
    publishedAt: new Date(row.published_at),
    createdAt: new Date(row.created_at),
  };

  const sourceLabel = TECH_NEWS_SOURCE_LABELS[news.source];

  // Chrome Dev 블로그 한국어 URL 생성
  const chromeKoreanUrl = getChromeKoreanUrl(news.source, news.originalUrl);

  let isValidOriginalUrl = false;
  try {
    const urlObj = new URL(news.originalUrl);
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      isValidOriginalUrl = true;
    }
  } catch (e) {
    // URL parsing failed
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* 뒤로 가기 */}
      <BackLink href="/news">뉴스 목록으로</BackLink>

      {/* 헤더 */}
      <header className="mb-10 border-b border-gray-100 pb-8">
        {/* 소스 뱃지 */}
        <div className="mb-4">
          <TagBadge tag={sourceLabel} hash={false} />
        </div>

        {/* 제목 — 페이지 제목은 text-3xl (design-system.md 크기 체계) */}
        <h1 className="mb-4 text-3xl leading-snug font-bold tracking-tight text-gray-900">
          {news.title}
        </h1>

        {/* 발행일 */}
        <time dateTime={news.publishedAt.toISOString()} className="text-sm text-gray-400">
          {formatDateKo(news.publishedAt)}
        </time>
      </header>

      {/* 마크다운 요약 — 본문 스타일은 게시글과 동일하게 globals.css의 .prose가 단일 출처 */}
      <section className="mb-12">
        <NewsContent content={news.content} />
      </section>

      {/* 원본 링크 섹션 */}
      <footer className="rounded-lg bg-gray-50 p-6">
        <p className="mb-4 text-sm font-medium text-gray-500">원문 읽기</p>
        <div className="space-y-3">
          {/* 원본 (영어) 링크 */}
          {isValidOriginalUrl && (
            <NewsSourceCard
              newsId={news.id}
              source={news.source}
              url={news.originalUrl}
              title={news.title}
              description={`${sourceLabel}에서 발행한 원문 기사입니다.`}
              sourceLabel={sourceLabel}
            />
          )}

          {/* Chrome Dev 블로그 한국어 버전 */}
          {chromeKoreanUrl && (
            <NewsSourceCard
              newsId={news.id}
              source={news.source}
              url={chromeKoreanUrl}
              title={`${news.title} — 한국어`}
              description="Chrome for Developers에서 제공하는 한국어 버전입니다."
              sourceLabel="한국어"
            />
          )}
        </div>
      </footer>
    </div>
  );
}

/**
 * Chrome Dev 블로그 기사의 한국어 URL을 생성한다.
 * /en/ 경로를 /ko/ 로 치환하거나, ?hl=ko 파라미터를 추가한다.
 */
function getChromeKoreanUrl(source: TechNewsSource, originalUrl: string): string | null {
  if (source !== 'chrome') return null;

  try {
    const url = new URL(originalUrl);
    if (url.hostname !== 'developer.chrome.com') return null;

    // /en/ 경로가 있으면 /ko/ 로 치환
    if (url.pathname.includes('/en/')) {
      url.pathname = url.pathname.replace('/en/', '/ko/');
      return url.toString();
    }

    // 그 외의 경우 ?hl=ko 파라미터 추가
    url.searchParams.set('hl', 'ko');
    return url.toString();
  } catch {
    return null;
  }
}

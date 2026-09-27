/**
 * @file page.tsx
 * @description 기술 뉴스 상세 페이지. 마크다운 해설과 원문 링크를 보여주고,
 *              Chrome 블로그 기사에는 한국어 버전 링크를 함께 제공한다.
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
 * 5분 ISR. supabase-js의 fetch에는 캐시 옵션이 없어 force-static으로 캐싱을 강제해야 revalidate가 동작한다.
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

  const chromeKoreanUrl = getChromeKoreanUrl(news.source, news.originalUrl);

  let isValidOriginalUrl = false;
  try {
    const urlObj = new URL(news.originalUrl);
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      isValidOriginalUrl = true;
    }
  } catch (e) {
    // 잘못된 URL이면 원문 링크를 보여주지 않는다.
  }

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/news">뉴스 목록으로</BackLink>

      <header className="mb-10 border-b border-gray-100 pb-8">
        <div className="mb-4">
          <TagBadge tag={sourceLabel} hash={false} />
        </div>

        <h1 className="mb-4 text-3xl leading-snug font-bold tracking-tight text-gray-900">
          {news.title}
        </h1>

        <time dateTime={news.publishedAt.toISOString()} className="text-sm text-gray-400">
          {formatDateKo(news.publishedAt)}
        </time>
      </header>

      <section className="mb-12">
        <NewsContent content={news.content} />
      </section>

      <footer className="rounded-lg bg-gray-50 p-6">
        <p className="mb-4 text-sm font-medium text-gray-500">원문 읽기</p>
        <div className="space-y-3">
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
 * Chrome 블로그(developer.chrome.com) 기사의 한국어 URL을 만든다. 다른 소스면 null을 반환한다.
 */
function getChromeKoreanUrl(source: TechNewsSource, originalUrl: string): string | null {
  if (source !== 'chrome') return null;

  try {
    const url = new URL(originalUrl);
    if (url.hostname !== 'developer.chrome.com') return null;

    if (url.pathname.includes('/en/')) {
      url.pathname = url.pathname.replace('/en/', '/ko/');
      return url.toString();
    }

    url.searchParams.set('hl', 'ko');
    return url.toString();
  } catch {
    return null;
  }
}

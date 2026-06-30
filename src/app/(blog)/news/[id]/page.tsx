/**
 * @file page.tsx
 * @description 기술 뉴스 상세 페이지.
 *              Supabase에서 뉴스 데이터를 가져와 마크다운 요약을 렌더링한다.
 *              Chrome Dev 기사의 경우 한국어 버전 링크를 함께 제공한다.
 */

import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

import { supabase } from '@/lib/supabase';
import { TECH_NEWS_SOURCE_LABELS } from '@/types/tech-news.type';
import type { TechNews, TechNewsSource } from '@/types/tech-news.type';

import type { Metadata } from 'next';

interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

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
      <Link
        href="/news"
        className="mb-8 flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-orange-500"
      >
        <ArrowLeft className="h-4 w-4" />
        뉴스 목록으로
      </Link>

      {/* 헤더 */}
      <header className="mb-10 border-b border-gray-100 pb-8">
        {/* 소스 뱃지 */}
        <div className="mb-4">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
            {sourceLabel}
          </span>
        </div>

        {/* 제목 */}
        <h1 className="mb-4 text-2xl leading-snug font-bold tracking-tight text-gray-900">
          {news.title}
        </h1>

        {/* 발행일 */}
        <time dateTime={news.publishedAt.toISOString()} className="text-sm text-gray-400">
          {news.publishedAt.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </header>

      {/* 마크다운 요약 */}
      <section className="mb-12">
        <div className="prose prose-gray prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-900 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-gray-800 prose-code:font-mono max-w-none">
          <ReactMarkdown>{news.content}</ReactMarkdown>
        </div>
      </section>

      {/* 원본 링크 섹션 */}
      <footer className="rounded-lg border border-gray-100 bg-gray-50 p-6">
        <p className="mb-4 text-sm font-medium text-gray-500">원문 읽기</p>
        <div className="flex flex-wrap gap-3">
          {/* 원본 (영어) 링크 */}
          {isValidOriginalUrl && (
            <a
              href={news.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-orange-300 hover:text-orange-600"
            >
              <ExternalLink className="h-4 w-4" />
              원본 뉴스 보러가기
            </a>
          )}

          {/* Chrome Dev 블로그 한국어 버전 */}
          {chromeKoreanUrl && (
            <a
              href={chromeKoreanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-orange-300 hover:text-orange-600"
            >
              <ExternalLink className="h-4 w-4" />
              🇰🇷 한국어 버전
            </a>
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

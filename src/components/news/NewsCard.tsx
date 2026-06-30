/**
 * @file NewsCard.tsx
 * @description 기술 뉴스 카드 컴포넌트.
 *              높이를 최소화한 콤팩트 한 줄 레이아웃.
 *              [백지/소스 뱃지] [뉴스 제목] [날짜] 형태로 배치.
 */

import Link from 'next/link';

import { formatDateKo } from '@/lib/utils/date';
import { TECH_NEWS_SOURCE_LABELS, type TechNews } from '@/types/tech-news.type';

interface NewsCardProps {
  news: Pick<TechNews, 'id' | 'title' | 'source' | 'publishedAt'>;
}

export default function NewsCard({ news }: NewsCardProps) {
  const sourceLabel = TECH_NEWS_SOURCE_LABELS[news.source];

  return (
    <article className="group py-3 first:pt-0 last:pb-0">
      <Link href={`/news/${news.id}`} className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* 소스 뱃지 (미니멀 스퀘어 형태) */}
          <span className="shrink-0 rounded bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600">
            {sourceLabel}
          </span>

          {/* 제목 */}
          <h3 className="truncate text-sm font-medium text-gray-800 transition-colors group-hover:text-orange-500">
            {news.title}
          </h3>
        </div>

        {/* 날짜 */}
        <time dateTime={news.publishedAt.toISOString()} className="shrink-0 text-xs text-gray-400">
          {formatDateKo(news.publishedAt)}
        </time>
      </Link>
    </article>
  );
}

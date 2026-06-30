/**
 * @file NewsCard.tsx
 * @description 기술 뉴스 카드 컴포넌트.
 *              PostCard와 동일한 스타일 언어를 사용하며,
 *              소스 뱃지, 제목, 발행일을 표시한다.
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
    <article className="group py-6 first:pt-0 last:pb-0">
      <Link href={`/news/${news.id}`} className="block">
        {/* 소스 뱃지 */}
        <div className="mb-2">
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
            {sourceLabel}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="mb-3 text-lg font-semibold text-gray-900 transition-colors group-hover:text-orange-500">
          {news.title}
        </h3>

        {/* 메타 정보 */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <time dateTime={news.publishedAt.toISOString()}>{formatDateKo(news.publishedAt)}</time>
        </div>
      </Link>
    </article>
  );
}

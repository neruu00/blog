/**
 * @file NewsCard.tsx
 * @description 기술 뉴스 카드 컴포넌트.
 *              높이를 최소화한 콤팩트 한 줄 레이아웃.
 *              [백지/소스 뱃지] [뉴스 제목] [날짜] 형태로 배치.
 */

import Link from 'next/link';

import TagBadge from '@/components/ui/TagBadge';
import { formatRelativeTime } from '@/lib/utils/date';
import { TECH_NEWS_SOURCE_LABELS, type TechNews } from '@/types/tech-news.type';

interface NewsCardProps {
  news: Pick<TechNews, 'id' | 'title' | 'source' | 'publishedAt'>;
}

export default function NewsCard({ news }: NewsCardProps) {
  const sourceLabel = TECH_NEWS_SOURCE_LABELS[news.source];

  return (
    <article className="group py-3 first:pt-0 last:pb-0">
      <Link href={`/news/${news.id}`} className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 overflow-hidden">
          {/* 소스 뱃지 */}
          <TagBadge tag={sourceLabel} hash={false} />

          {/* 제목 */}
          <h3 className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-orange-500">
            {news.title}
          </h3>
        </div>

        {/* 날짜 — 뉴스는 신선도가 중요하므로 상대 시간("3시간 전")으로 표시 */}
        <time dateTime={news.publishedAt.toISOString()} className="shrink-0 text-xs text-gray-400">
          {formatRelativeTime(news.publishedAt)}
        </time>
      </Link>
    </article>
  );
}

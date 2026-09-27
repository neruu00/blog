/**
 * @file NewsCard.tsx
 * @description 소스 뱃지, 제목, 날짜를 한 줄로 보여주는 기술 뉴스 카드.
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
          <TagBadge tag={sourceLabel} hash={false} />

          <h3 className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-orange-500">
            {news.title}
          </h3>
        </div>

        {/* 날짜는 상대 시간("3시간 전")으로 표시한다 */}
        <time dateTime={news.publishedAt.toISOString()} className="shrink-0 text-xs text-gray-400">
          {formatRelativeTime(news.publishedAt)}
        </time>
      </Link>
    </article>
  );
}

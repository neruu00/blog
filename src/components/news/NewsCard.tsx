/**
 * @file NewsCard.tsx
 * @description 소스 뱃지, 제목, 날짜를 보여주는 기술 뉴스 카드. md 이상은 한 줄, 모바일은 제목 아래에 뱃지·날짜를 둔다.
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
      <Link
        href={`/news/${news.id}`}
        className="flex flex-wrap items-center gap-x-3 gap-y-1.5 md:flex-nowrap md:gap-x-4"
      >
        <span className="order-2 flex md:order-none">
          <TagBadge tag={sourceLabel} hash={false} />
        </span>

        <h3 className="order-1 line-clamp-2 basis-full text-sm font-medium text-gray-900 transition-colors group-hover:text-orange-500 md:order-none md:line-clamp-1 md:min-w-0 md:flex-1 md:basis-auto">
          {news.title}
        </h3>

        {/* 날짜는 상대 시간("3시간 전")으로 표시한다 */}
        <time
          dateTime={news.publishedAt.toISOString()}
          className="order-3 shrink-0 text-xs text-gray-400 md:order-none"
        >
          {formatRelativeTime(news.publishedAt)}
        </time>
      </Link>
    </article>
  );
}

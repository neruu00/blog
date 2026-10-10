/**
 * @file PostSeriesList.tsx
 * @description 게시글 상세 본문 위에 붙는 시리즈 목록. 같은 시리즈의 글을 순서대로 보여 주고 현재 글을 강조한다.
 */

import { Library } from 'lucide-react';
import Link from 'next/link';

import CollapsiblePanel from '@/components/common/CollapsiblePanel';
import type { PostSeries } from '@/types/series.type';

interface PostSeriesListProps {
  series: PostSeries;
  currentPostId: string;
}

export default function PostSeriesList({ series, currentPostId }: PostSeriesListProps) {
  const currentIndex = series.posts.findIndex((post) => post.id === currentPostId);

  return (
    <CollapsiblePanel
      icon={<Library />}
      title={series.title}
      aside={`${currentIndex + 1} / ${series.posts.length}`}
      defaultOpen
      className="mb-10"
    >
      <ol className="space-y-1.5">
        {series.posts.map((post, index) => {
          const isCurrent = post.id === currentPostId;

          return (
            <li key={post.id} className="flex gap-2 text-sm">
              <span className="w-5 flex-shrink-0 text-right text-gray-400">{index + 1}.</span>
              {isCurrent ? (
                <span aria-current="page" className="min-w-0 font-medium text-orange-500">
                  {post.title}
                </span>
              ) : (
                <Link
                  href={`/posts/${post.id}`}
                  className="min-w-0 text-gray-500 transition-colors hover:text-gray-900"
                >
                  {post.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </CollapsiblePanel>
  );
}

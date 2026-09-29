/**
 * @file PostSeriesList.tsx
 * @description 게시글 상세 본문 위에 붙는 시리즈 목록. 같은 시리즈의 글을 순서대로 보여 주고 현재 글을 강조한다.
 *              접기·펼치기는 `<details>`로 처리해 클라이언트 JS 없이 동작한다.
 */

import { ChevronDown, Library } from 'lucide-react';
import Link from 'next/link';

import type { PostSeries } from '@/types/series.type';

interface PostSeriesListProps {
  series: PostSeries;
  currentPostId: string;
}

export default function PostSeriesList({ series, currentPostId }: PostSeriesListProps) {
  const currentIndex = series.posts.findIndex((post) => post.id === currentPostId);

  return (
    <details open className="group mb-10 rounded-xl bg-gray-50 px-5 py-4">
      <summary className="flex list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <Library className="size-4 flex-shrink-0 text-orange-500" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
          {series.title}
        </span>
        <span className="flex-shrink-0 text-xs text-gray-500">
          {currentIndex + 1} / {series.posts.length}
        </span>
        <ChevronDown
          className="size-4 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>

      <ol className="mt-3 space-y-1.5">
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
    </details>
  );
}

/**
 * @file PostNavigation.tsx
 * @description 게시글 상세 하단의 이전/다음 글 내비게이션.
 *              이전 글 = 더 오래된 글, 다음 글 = 더 최신 글.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AdjacentPost {
  id: string;
  title: string;
}

interface PostNavigationProps {
  prev: AdjacentPost | null;
  next: AdjacentPost | null;
}

export default function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
      {prev ? (
        <Link href={`/posts/${prev.id}`} className="group flex min-w-0 flex-col gap-1">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <ChevronLeft className="h-3.5 w-3.5" />
            이전 글
          </span>
          <span className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-orange-500">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link href={`/posts/${next.id}`} className="group flex min-w-0 flex-col items-end gap-1">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            다음 글
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
          <span className="w-full truncate text-right text-sm font-medium text-gray-900 transition-colors group-hover:text-orange-500">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

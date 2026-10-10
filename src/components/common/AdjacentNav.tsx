/**
 * @file AdjacentNav.tsx
 * @description 상세 페이지 하단의 이전/다음 항목 내비게이션. 모바일은 한 열, md 이상은 두 열로 놓는다.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AdjacentItem {
  href: string;
  title: string;
}

interface AdjacentNavProps {
  prev: AdjacentItem | null;
  next: AdjacentItem | null;
  /** 이전 칸 위의 작은 라벨. 예: "이전 글" */
  prevLabel: string;
  nextLabel: string;
}

export default function AdjacentNav({ prev, next, prevLabel, nextLabel }: AdjacentNavProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 md:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className="group flex min-w-0 flex-col gap-1">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <ChevronLeft className="h-3.5 w-3.5" />
            {prevLabel}
          </span>
          <span className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-orange-500">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="hidden md:block" />
      )}

      {next ? (
        <Link href={next.href} className="group flex min-w-0 flex-col items-end gap-1">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            {nextLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
          <span className="w-full truncate text-right text-sm font-medium text-gray-900 transition-colors group-hover:text-orange-500">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="hidden md:block" />
      )}
    </nav>
  );
}

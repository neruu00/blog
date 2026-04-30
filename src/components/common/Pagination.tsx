/**
 * @file Pagination.tsx
 * @description 게시글 목록 하단에 표시되는 페이지네이션 컴포넌트.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  currentTag?: string;
}

export default function Pagination({ currentPage, totalPages, currentTag }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageLink = (page: number) => {
    const params = new URLSearchParams();
    if (currentTag && currentTag !== 'All') params.set('tag', currentTag);
    if (page > 1) params.set('page', page.toString());
    const queryString = params.toString();
    return queryString ? `/posts?${queryString}` : '/posts';
  };

  // 표시할 페이지 번호 범위 계산 (최대 5개)
  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const endPage = Math.min(totalPages, startPage + 4);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      {/* 이전 페이지 */}
      <Link
        href={getPageLink(currentPage - 1)}
        className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
          currentPage > 1
            ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
            : 'pointer-events-none border-gray-100 text-gray-300'
        }`}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {/* 페이지 번호 */}
      {pages.map((page) => {
        const isCurrent = page === currentPage;
        return (
          <Link
            key={page}
            href={getPageLink(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
              isCurrent
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {page}
          </Link>
        );
      })}

      {/* 다음 페이지 */}
      <Link
        href={getPageLink(currentPage + 1)}
        className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
          currentPage < totalPages
            ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
            : 'pointer-events-none border-gray-100 text-gray-300'
        }`}
        aria-disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}

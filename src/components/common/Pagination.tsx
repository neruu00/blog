/**
 * @file Pagination.tsx
 * @description 목록 하단에 표시되는 도메인 중립 페이지네이션 컴포넌트.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** 페이지 링크의 기본 경로 (예: '/posts') */
  basePath: string;
  /** 페이지 번호 외에 유지할 쿼리 파라미터 (예: { tag: 'React' }) */
  params?: Record<string, string>;
}

export default function Pagination({ currentPage, totalPages, basePath, params }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageLink = (page: number) => {
    const searchParams = new URLSearchParams(params);
    if (page > 1) searchParams.set('page', page.toString());
    const queryString = searchParams.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  // 표시할 페이지 번호 범위 계산 (최대 5개)
  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const endPage = Math.min(totalPages, startPage + 4);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const cell =
    'flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors';
  const idle = 'border-gray-200 text-gray-500 hover:bg-gray-50';
  const blocked = 'pointer-events-none border-gray-100 text-gray-400';

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      {/* 이전 페이지 */}
      <Link
        href={getPageLink(currentPage - 1)}
        className={`${cell} ${currentPage > 1 ? idle : blocked}`}
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
            className={`${cell} ${isCurrent ? 'border-orange-500 bg-orange-500 text-white' : idle}`}
          >
            {page}
          </Link>
        );
      })}

      {/* 다음 페이지 */}
      <Link
        href={getPageLink(currentPage + 1)}
        className={`${cell} ${currentPage < totalPages ? idle : blocked}`}
        aria-disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}

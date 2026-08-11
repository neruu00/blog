'use client';

/**
 * @file error.tsx
 * @description (blog) 라우트 그룹 에러 바운더리.
 *              Supabase 조회 실패 등 렌더 중 예외를 잡아 재시도 UI를 제공한다.
 */

import { AlertTriangle, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[blog] 렌더 중 오류:', error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
        <AlertTriangle className="h-7 w-7 text-orange-500" />
      </div>

      <h1 className="mb-2 text-xl font-bold text-gray-900">문제가 발생했습니다</h1>
      <p className="mb-8 text-sm leading-relaxed text-gray-500">
        데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        {error.digest && (
          <>
            <br />
            <span className="text-xs text-gray-400">오류 코드: {error.digest}</span>
          </>
        )}
      </p>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <RotateCw className="h-4 w-4" />
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-orange-300 hover:text-orange-500"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}

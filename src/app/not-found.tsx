/**
 * @file not-found.tsx
 * @description 전역 404 페이지. 매칭되지 않는 경로와 notFound() 호출을 모두 처리한다.
 */

import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 text-5xl font-bold tracking-tight text-orange-500">404</p>
      <h1 className="mb-2 text-xl font-bold text-gray-900">페이지를 찾을 수 없습니다</h1>
      <p className="mb-8 text-sm text-gray-500">주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>

      <div className="flex gap-3">
        <Button href="/">홈으로</Button>
        <Button href="/posts" variant="outline">
          전체 글 보기
        </Button>
      </div>
    </div>
  );
}

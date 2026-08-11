/**
 * @file loading.tsx
 * @description (blog) 라우트 그룹 로딩 스켈레톤.
 *              Server Component가 Supabase 응답을 기다리는 동안 표시된다.
 */

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse" aria-busy="true" aria-label="불러오는 중">
      <div className="mb-10">
        <div className="mb-3 h-8 w-1/3 rounded bg-gray-100" />
        <div className="h-4 w-1/5 rounded bg-gray-100" />
      </div>

      <div className="flex flex-col divide-y divide-gray-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="py-6">
            <div className="mb-3 h-5 w-3/4 rounded bg-gray-100" />
            <div className="mb-2 h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-2/3 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

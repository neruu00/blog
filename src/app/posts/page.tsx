import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { mockPosts } from '@/mocks/mockPosts';
import extractTextFromTiptap from '@/lib/extractTextFromTiptap';

export default function PostsPage() {
  // 최신 글이 위로 오도록 정렬
  const sortedPosts = [...mockPosts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* 상단 네비게이션 & 타이틀 */}
        <header className="mb-12">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-orange-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            모든 포스트
            <span className="ml-2 text-orange-500">.</span>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-neutral-400">
            지금까지 작성한 {sortedPosts.length}개의 글을 확인해 보세요.
          </p>
        </header>

        {/* 게시글 리스트 영역 */}
        <div className="space-y-6">
          {sortedPosts.map((post, index) => {
            // Tiptap JSON에서 본문 텍스트 추출 (최대 150자)
            const plainText = extractTextFromTiptap(post.content);
            const snippet = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;

            // 날짜 포맷팅 (예: 2026년 2월 26일)
            const formattedDate = new Intl.DateTimeFormat('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(post.createdAt);

            return (
              <article
                key={index}
                className="group relative flex flex-col items-start justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-orange-400 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-orange-500"
              >
                <div className="mb-4 w-full">
                  <h2 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-orange-500 dark:text-white">
                    <Link href={`/posts/${index}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 line-clamp-2 text-base leading-relaxed text-gray-600 dark:text-neutral-400">
                    {snippet}
                  </p>
                </div>

                <div className="flex w-full items-center justify-between gap-4">
                  <time
                    dateTime={post.createdAt.toISOString()}
                    className="text-sm text-gray-500 dark:text-neutral-500"
                  >
                    {formattedDate}
                  </time>
                  {/* 태그 (최대 3개만 표시) */}
                  <div className="hidden flex-wrap gap-2 sm:flex">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';

import extractTextFromTiptap from '@/lib/extractTextFromTiptap';
import { BlogPost } from '@/mocks/mockPosts';

export default function PostCard({ post }: { post: BlogPost }) {
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
      key={post.id}
      className="group relative flex flex-col items-start justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-orange-400 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-orange-500"
    >
      <div className="mb-4 w-full">
        <h2 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-orange-500 dark:text-white">
          <Link href={`/posts/${post.id}`}>
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
}

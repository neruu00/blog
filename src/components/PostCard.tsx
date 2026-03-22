import Link from 'next/link';

import extractTextFromTiptap from '@/lib/extractTextFromTiptap';
import { Post } from '@/types/post.type';

interface Props {
  post: Post;
  index: number;
}

export default function PostCard({ post, index }: Props) {
  const plainText = extractTextFromTiptap(post.content);
  const snippet = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;

  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(post.createdAt);

  const bgColors = [
    'bg-blue-50 dark:bg-blue-900/20',
    'bg-yellow-50 dark:bg-yellow-900/20',
    'bg-pink-50 dark:bg-pink-900/20',
    'bg-green-50 dark:bg-green-900/20',
  ];
  const pinColors = ['bg-red-400', 'bg-brand', 'bg-pink-400', 'bg-green-500'];
  const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];

  const bgColor = bgColors[index % bgColors.length];
  const pinColor = pinColors[index % pinColors.length];
  const rotation = rotations[index % rotations.length];

  return (
    <article
      key={post.id}
      className={`group relative flex flex-col items-start justify-between p-8 shadow-md transition-all hover:scale-105 hover:shadow-xl dark:shadow-neutral-900 ${bgColor} ${rotation} hover:z-20`}
    >
      {/* Pin */}
      <div
        className={`absolute -top-2 left-1/2 -ml-2 h-4 w-4 rounded-full ${pinColor} z-10 border border-white/40 shadow-[0_2px_4px_rgba(0,0,0,0.3)]`}
      ></div>

      <div className="mb-4 w-full">
        <h2 className="mb-2 text-2xl font-bold text-slate-800 transition-colors dark:text-slate-100">
          <Link href={`/posts/${post.id}`}>
            <span className="absolute inset-0" />
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {snippet}
        </p>
      </div>

      <div className="mt-auto flex w-full items-center justify-between gap-4 pt-4">
        {/* 태그 (최대 1개만 표시, 카테고리처럼) */}
        <div className="flex gap-2">
          {post.tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="text-brand font-sans text-[10px] font-semibold tracking-wider dark:bg-black/20"
            >
              {tag.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

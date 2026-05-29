/**
 * @file PostCard.tsx
 * @description 게시글 카드 컴포넌트.
 *              velog 스타일의 미니멀한 리스트형 디자인.
 *              제목, 요약, 태그, 날짜, 조회수를 표시한다.
 */

import { Eye } from 'lucide-react';
import Link from 'next/link';

import TagBadge from '@/components/ui/TagBadge';
import { formatDateKo } from '@/lib/utils/date';
import { extractTextFromTiptap } from '@/lib/utils/tiptap';
import type { Post } from '@/types/post.type';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // Tiptap JSON에서 순수 텍스트를 추출하여 요약 생성
  const plainText = extractTextFromTiptap(post.content);
  const snippet = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;

  return (
    <article className="group py-6 first:pt-0 last:pb-0">
      <Link href={`/posts/${post.id}`} className="block">
        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} tag={tag} variant="primary" />
            ))}
          </div>
        )}

        {/* 제목 */}
        <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-orange-500">
          {post.title}
        </h3>

        {/* 요약 */}
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">{snippet}</p>

        {/* 메타 정보 */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <time dateTime={post.createdAt.toISOString()}>{formatDateKo(post.createdAt)}</time>
          <span className="text-gray-200">·</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.viewCount}
          </span>
        </div>
      </Link>
    </article>
  );
}

/**
 * @file PostCard.tsx
 * @description 태그, 제목, 요약, 날짜, 조회수를 보여주는 게시글 목록 카드. 시리즈 글은 제목 앞에 [시리즈 이름]을 붙인다.
 */

import { Eye } from 'lucide-react';
import Link from 'next/link';

import TagBadge from '@/components/ui/TagBadge';
import { formatDateKo } from '@/lib/utils/date';
import { extractTextFromTiptap } from '@/lib/utils/tiptap';
import type { Post } from '@/types/post.type';

interface PostCardProps {
  post: Post;
  /** 문서 아웃라인용 헤딩 레벨 — h1 바로 아래(posts 목록)면 h2, 섹션(h2) 아래면 h3 */
  titleAs?: 'h2' | 'h3';
}

export default function PostCard({ post, titleAs: TitleTag = 'h3' }: PostCardProps) {
  const plainText = extractTextFromTiptap(post.content);
  const snippet = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;

  return (
    <article className="group py-6 first:pt-0 last:pb-0">
      <Link href={`/posts/${post.id}`} className="block">
        {post.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        <TitleTag className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-orange-500">
          {post.seriesTitle && `[${post.seriesTitle}] `}
          {post.title}
        </TitleTag>

        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">{snippet}</p>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <time dateTime={post.createdAt.toISOString()}>{formatDateKo(post.createdAt)}</time>
          <span className="text-gray-400">·</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.viewCount}
          </span>
        </div>
      </Link>
    </article>
  );
}

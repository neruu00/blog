/**
 * @file PostCard.tsx
 * @description 게시글 카드 컴포넌트.
 *              velog 스타일의 미니멀한 리스트형 디자인.
 *              제목, 요약, 태그, 날짜, 조회수를 표시한다.
 */

import { Clock, Eye } from 'lucide-react';
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
  // Tiptap JSON에서 순수 텍스트를 추출하여 요약 생성
  const plainText = extractTextFromTiptap(post.content);
  const snippet = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;
  // ponytail: 한국어 분당 500자 가정의 단순 추정 — 코드 블록 가중치가 필요해지면 개선
  const readingMinutes = Math.max(1, Math.round(plainText.length / 500));

  return (
    <article className="group py-6 first:pt-0 last:pb-0">
      <Link href={`/posts/${post.id}`} className="block">
        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* 제목 */}
        <TitleTag className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-orange-500">
          {post.title}
        </TitleTag>

        {/* 요약 */}
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">{snippet}</p>

        {/* 메타 정보 */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <time dateTime={post.createdAt.toISOString()}>{formatDateKo(post.createdAt)}</time>
          <span className="text-gray-400">·</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.viewCount}
          </span>
          <span className="text-gray-400">·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readingMinutes}분
          </span>
        </div>
      </Link>
    </article>
  );
}

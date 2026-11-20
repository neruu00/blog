/**
 * @file PostCard.tsx
 * @description 제목과 날짜·조회수 한 줄로 이뤄진 게시글 목록 항목. 시리즈와 태그는 표시하지 않는다.
 */

import Link from 'next/link';

import { formatDateKo } from '@/lib/utils/date';
import type { Post } from '@/types/post.type';

interface PostCardProps {
  post: Post;
  /** 문서 아웃라인용 헤딩 레벨 — h1 바로 아래(posts 목록)면 h2, 섹션(h2) 아래면 h3 */
  titleAs?: 'h2' | 'h3';
}

export default function PostCard({ post, titleAs: TitleTag = 'h3' }: PostCardProps) {
  return (
    // 여백을 article이 아니라 링크에 줘야 hover 배경이 구분선 사이를 빈틈없이 채운다.
    // 음수 마진은 링크의 좌우 여백만큼 배경을 넓혀 글자 시작선을 목록 밖 요소와 맞춘다
    <article className="group">
      <Link
        href={`/posts/${post.id}`}
        className="-mx-3 block px-3 py-5 transition-colors duration-200 ease-out hover:bg-orange-50"
      >
        <TitleTag className="mb-1.5 text-lg font-semibold text-gray-900 transition-colors duration-200 ease-out group-hover:text-orange-500">
          {post.title}
        </TitleTag>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
          <time dateTime={post.createdAt.toISOString()}>{formatDateKo(post.createdAt)}</time>
          <span aria-hidden="true" className="text-gray-400">
            ·
          </span>
          <span className="tabular-nums">조회 {post.viewCount}</span>
        </div>
      </Link>
    </article>
  );
}

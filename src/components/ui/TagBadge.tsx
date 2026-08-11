/**
 * @file TagBadge.tsx
 * @description 사이트 전역 공용 뱃지. 게시글 기술 태그와 뉴스 소스 라벨이 공유한다.
 *              스타일은 하나다 — 컴팩트 스퀘어, 주황 소프트 배경 (플랫 원칙).
 */

interface TagBadgeProps {
  tag: string;
  /** 해시(#) 접두사 표시 여부 — 기술 태그는 기본 true, 뉴스 소스 라벨은 false */
  hash?: boolean;
}

export default function TagBadge({ tag, hash = true }: TagBadgeProps) {
  const label = hash && !tag.startsWith('#') ? `#${tag}` : tag;

  return (
    <span className="shrink-0 rounded bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600">
      {label}
    </span>
  );
}

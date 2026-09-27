/**
 * @file TagBadge.tsx
 * @description 게시글 태그와 뉴스 소스 라벨이 함께 쓰는 공용 뱃지.
 */

interface TagBadgeProps {
  tag: string;
  /** 해시(#) 접두사 표시 여부 — 기술 태그는 기본 true, 뉴스 소스 라벨은 false */
  hash?: boolean;
}

export default function TagBadge({ tag, hash = true }: TagBadgeProps) {
  const label = hash && !tag.startsWith('#') ? `#${tag}` : tag;

  // orange-600은 orange-50 배경에서 대비가 3.3:1이라 12px 텍스트 AA(4.5:1)를 통과하지 못해 orange-700을 쓴다
  return (
    <span className="shrink-0 rounded bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
      {label}
    </span>
  );
}

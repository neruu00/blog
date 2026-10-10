/**
 * @file FilterChipGroup.tsx
 * @description FilterChip을 나란히 놓는 줄. 모바일에서는 한 줄 가로 스크롤, md 이상에서는 여러 줄로 감긴다.
 */

import { cn } from '@/lib/utils';

interface FilterChipGroupProps {
  /** 스크린 리더용 필터 이름. 예: "태그 필터" */
  label: string;
  className?: string;
  children: React.ReactNode;
}

/** 모바일에서는 본문 여백(gutter)만큼 양옆으로 넓혀 칩이 화면 끝까지 스크롤되게 한다. */
export default function FilterChipGroup({ label, className, children }: FilterChipGroupProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        '-mx-gutter px-gutter flex gap-2 overflow-x-auto md:mx-0 md:flex-wrap md:overflow-visible md:px-0',
        className,
      )}
    >
      {children}
    </nav>
  );
}

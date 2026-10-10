/**
 * @file CollapsiblePanel.tsx
 * @description 회색 배경의 접이식 패널. `<details>`로 접고 펼쳐 클라이언트 JS 없이 동작한다.
 */

import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

interface CollapsiblePanelProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  /** 제목 오른쪽, 펼침 화살표 앞에 붙는 보조 표기. 예: "2 / 5" */
  aside?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function CollapsiblePanel({
  icon,
  title,
  aside,
  defaultOpen = false,
  className,
  children,
}: CollapsiblePanelProps) {
  return (
    <details open={defaultOpen} className={cn('group rounded-xl bg-gray-50 px-5 py-4', className)}>
      <summary className="flex list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <span className="flex flex-shrink-0 text-orange-500 [&>svg]:size-4" aria-hidden>
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{title}</span>
        {aside != null && <span className="flex-shrink-0 text-xs text-gray-500">{aside}</span>}
        <ChevronDown
          className="size-4 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="mt-3">{children}</div>
    </details>
  );
}

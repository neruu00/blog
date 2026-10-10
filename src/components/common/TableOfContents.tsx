'use client';

import { ListTree } from 'lucide-react';

import CollapsiblePanel from '@/components/common/CollapsiblePanel';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { TocItem } from '@/lib/utils/tiptap';

interface TableOfContentsProps {
  items: TocItem[];
  /** sidebar: 본문 옆에 고정되는 목록. collapsible: 본문 위에 붙는 접이식 패널(좁은 화면용) */
  variant?: 'sidebar' | 'collapsible';
}

/** 헤딩 id는 본문(PostContent·ProjectDetail)이 서버 렌더링 때 같은 배열로 붙인다. */
export default function TableOfContents({ items, variant = 'sidebar' }: TableOfContentsProps) {
  const itemIds = items.map((item) => item.id);
  const activeId = useIntersectionObserver(itemIds, { rootMargin: '0% 0% -80% 0%' });

  if (items.length === 0) return null;

  const list = (
    <ul className="space-y-2 border-l-2 border-gray-100 pl-4 text-sm text-gray-500">
      {items.map((item, index) => (
        <li
          key={`${item.id}-${index}`}
          style={{ paddingLeft: `${Math.max(0, item.level - 2) * 0.75}rem` }}
        >
          <a
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              // 접이식 패널은 이동한 뒤 닫아 본문을 가리지 않게 한다
              e.currentTarget.closest('details')?.removeAttribute('open');
              const target = document.getElementById(item.id);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', `#${item.id}`);
              }
            }}
            className={`transition-colors hover:text-orange-500 ${
              activeId === item.id ? 'font-medium text-orange-500' : ''
            }`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === 'collapsible') {
    return (
      <CollapsiblePanel icon={<ListTree />} title="목차" className="mb-10">
        {list}
      </CollapsiblePanel>
    );
  }

  // 표시 여부(hidden xl:block)는 부모(page.tsx)가 결정한다
  return (
    <div className="sticky top-24 w-64 shrink-0">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">목차</h3>
      {list}
    </div>
  );
}

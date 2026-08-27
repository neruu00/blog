'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { TocItem } from '@/lib/utils/tiptap';

/**
 * 헤딩 id는 PostContent가 서버 렌더 시 같은 배열로 붙인다.
 * 클라이언트에서 DOM을 뒤져 심는 방식은 첫 로드 해시 스크롤을 놓쳤다.
 */
export default function TableOfContents({ items }: { items: TocItem[] }) {
  const itemIds = items.map((item) => item.id);
  const activeId = useIntersectionObserver(itemIds, { rootMargin: '0% 0% -80% 0%' });

  if (items.length === 0) return null;

  // 표시 여부(hidden xl:block)는 부모(page.tsx)가 결정한다
  return (
    <div className="sticky top-24 w-64 shrink-0">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">목차</h3>
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
    </div>
  );
}

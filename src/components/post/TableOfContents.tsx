'use client';

import { useEffect } from 'react';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { TocItem } from '@/lib/utils/tiptap';

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const itemIds = items.map((item) => item.id);
  const activeId = useIntersectionObserver(itemIds, { rootMargin: '0% 0% -80% 0%' });

  useEffect(() => {
    if (items.length === 0) return;

    const trySetIds = () => {
      const headings = document.querySelectorAll('.prose h2, .prose h3, .prose h4');
      if (headings.length > 0) {
        headings.forEach((heading, index) => {
          if (items[index]) {
            heading.id = items[index].id;
            (heading as HTMLElement).style.scrollMarginTop = '100px';
          }
        });
        return true;
      }
      return false;
    };

    let mutationObserver: MutationObserver | null = null;

    if (!trySetIds()) {
      mutationObserver = new MutationObserver(() => {
        if (trySetIds()) {
          mutationObserver?.disconnect();
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      mutationObserver?.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="sticky top-24 hidden w-56 shrink-0 lg:block xl:w-64">
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

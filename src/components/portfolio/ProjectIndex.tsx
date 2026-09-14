/**
 * @file ProjectIndex.tsx
 * @description 프로젝트 목록 좌측 고정 인덱스. 현재 보고 있는 프로젝트를 강조한다.
 *              게시글 상세의 TableOfContents와 같은 패턴 — 훅도 같은 걸 쓴다.
 *              표시 여부(hidden xl:block)는 부모가 정한다.
 */

'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface ProjectIndexProps {
  items: { id: string; name: string }[];
}

export default function ProjectIndex({ items }: ProjectIndexProps) {
  const activeId = useIntersectionObserver(
    items.map((item) => item.id),
    { rootMargin: '0% 0% -70% 0%' },
  );

  return (
    <nav className="sticky top-24 w-40 shrink-0" aria-label="프로젝트 목록">
      <ul className="space-y-2 border-l-2 border-gray-100 pl-4 text-sm text-gray-400">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'true' : undefined}
                className={`transition-colors hover:text-orange-500 ${
                  active ? 'font-medium text-orange-500' : ''
                }`}
              >
                {item.name}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

'use client';

import { useEffect, useState } from 'react';

import type { TocItem } from '@/lib/utils/tiptap';

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) return;

    let observer: IntersectionObserver;

    // Tiptap 렌더링 영역의 헤딩 태그들에 ID 속성 부여 및 Observer 바인딩
    const initToc = () => {
      const headings = document.querySelectorAll('.prose h1, .prose h2, .prose h3');

      // 아직 DOM에 렌더링되지 않았다면 false 반환
      if (headings.length === 0) return false;

      headings.forEach((heading, index) => {
        if (items[index]) {
          heading.id = items[index].id;
          // 헤더에 가려지지 않도록 CSS 변수 설정
          (heading as HTMLElement).style.scrollMarginTop = '100px';
        }
      });

      // 스크롤 시 현재 활성화된 헤딩 감지
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: '0% 0% -80% 0%' },
      );

      headings.forEach((h) => observer.observe(h));
      return true; // 성공
    };

    // TiptapViewer의 비동기 렌더링(immediatelyRender: false)을 기다림
    let attempts = 0;
    const checkInterval = setInterval(() => {
      if (initToc() || attempts > 20) {
        // 성공했거나 2초가 넘도록 안 나타나면 폴링 중지
        clearInterval(checkInterval);
      }
      attempts++;
    }, 100);

    return () => {
      clearInterval(checkInterval);
      if (observer) observer.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="sticky top-24 hidden w-56 shrink-0 lg:block xl:w-64">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">목차</h3>
      <ul className="space-y-2 border-l-2 border-gray-100 pl-4 text-sm text-gray-500">
        {items.map((item, index) => (
          <li key={`${item.id}-${index}`} style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(item.id);
                if (target) {
                  // 부드러운 스크롤 이동
                  target.scrollIntoView({ behavior: 'smooth' });
                  // URL 해시 업데이트 (옵션)
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

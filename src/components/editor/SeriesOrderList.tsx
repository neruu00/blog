'use client';

/**
 * @file SeriesOrderList.tsx
 * @description 시리즈 안에서 이 글의 위치를 고르는 목록. 움직일 수 있는 행은 "이 글" 하나뿐이다.
 *              손잡이를 끌어 원하는 글 사이에 놓거나(마우스·터치), 손잡이에 포커스를 두고 ↑/↓ 키로 옮긴다.
 */

import { GripVertical } from 'lucide-react';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import type { SeriesPost } from '@/types/series.type';

interface SeriesOrderListProps {
  /** 이 글을 뺀 시리즈 글 목록(순서대로) */
  posts: SeriesPost[];
  /** "이 글" 행에 표시할 제목 */
  currentTitle: string;
  /** 이 글이 들어갈 위치. 0이면 맨 앞, `posts.length`면 맨 끝 */
  index: number;
  onIndexChange: (index: number) => void;
}

export default function SeriesOrderList({
  posts,
  currentTitle,
  index,
  onIndexChange,
}: SeriesOrderListProps) {
  const listRef = useRef<HTMLOListElement>(null);
  // 드래그를 시작할 때 잰 다른 행들의 위치. 드래그 중에는 목록이 움직이지 않으므로 다시 재지 않는다
  const rowRectsRef = useRef<DOMRect[]>([]);
  const [drag, setDrag] = useState<{ dropIndex: number; indicatorTop: number } | null>(null);

  const rows = [
    ...posts.slice(0, index).map((post) => ({ ...post, isCurrent: false })),
    { id: 'current', title: currentTitle, isCurrent: true },
    ...posts.slice(index).map((post) => ({ ...post, isCurrent: false })),
  ];

  /** 포인터 위치로 드롭 위치와 표시선 위치(목록 기준 px)를 구한다 */
  const measureDrop = (clientY: number) => {
    const list = listRef.current;
    const rects = rowRectsRef.current;
    if (!list || rects.length === 0) return null;

    const dropIndex = rects.filter((rect) => rect.top + rect.height / 2 < clientY).length;
    const edge = dropIndex < rects.length ? rects[dropIndex].top : rects[rects.length - 1].bottom;
    const indicatorTop = edge - list.getBoundingClientRect().top + list.scrollTop;
    return { dropIndex, indicatorTop };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!listRef.current || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    rowRectsRef.current = [
      ...listRef.current.querySelectorAll<HTMLElement>('[data-series-row="other"]'),
    ].map((row) => row.getBoundingClientRect());
    setDrag(measureDrop(e.clientY));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    setDrag(measureDrop(e.clientY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    onIndexChange(drag.dropIndex);
    setDrag(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      onIndexChange(index - 1);
    } else if (e.key === 'ArrowDown' && index < posts.length) {
      e.preventDefault();
      onIndexChange(index + 1);
    }
  };

  return (
    <ol ref={listRef} className="relative max-h-64 space-y-1 overflow-y-auto">
      {rows.map((row, rowIndex) => (
        <li
          key={row.id}
          data-series-row={row.isCurrent ? 'current' : 'other'}
          className={cn(
            'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm',
            row.isCurrent ? 'bg-orange-50 font-medium text-orange-600' : 'text-gray-500',
            row.isCurrent && drag && 'opacity-50',
          )}
        >
          <span className="w-5 flex-shrink-0 text-right text-gray-400">{rowIndex + 1}.</span>
          <span className="min-w-0 flex-1 truncate">{row.title}</span>
          {row.isCurrent && posts.length > 0 && (
            <button
              type="button"
              aria-label={`이 글의 순서, ${index + 1}번째. 끌거나 위아래 화살표 키로 옮깁니다`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => setDrag(null)}
              onKeyDown={handleKeyDown}
              className="flex-shrink-0 cursor-grab touch-none rounded p-1 text-orange-400 transition-colors hover:bg-orange-100 hover:text-orange-600 active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </button>
          )}
        </li>
      ))}

      {drag && (
        <li
          aria-hidden
          // 드래그 중 포인터 위치에서 계산하는 값이라 인라인 style을 쓴다
          style={{ top: drag.indicatorTop }}
          className="pointer-events-none absolute inset-x-2 h-0.5 -translate-y-1/2 rounded-full bg-orange-500"
        />
      )}
    </ol>
  );
}

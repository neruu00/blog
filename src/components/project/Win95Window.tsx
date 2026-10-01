/**
 * @file Win95Window.tsx
 * @description /portfolio 바탕화면의 Windows 95 창 하나. 제목줄·(폴더·문서면) 주소창·본문·상태 표시줄로 구성된다.
 *              위치·크기·쌓임 순서는 Win95WindowManager가 갖고, 이 컴포넌트는 그리기와 제목줄 끌기만 맡는다.
 */

'use client';

import { Minus, X } from 'lucide-react';
import { useRef } from 'react';

import Win95Button from '@/components/project/Win95Button';
import { FolderIcon } from '@/components/project/Win95Icons';

import type { PointerEvent } from 'react';

export interface Win95WindowFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
}

interface Win95WindowProps {
  title: string;
  icon: React.ReactNode;
  /** 주소창에 표시하는 가상 경로. 폴더·문서 창에만 주고, 앱 창에는 주소창을 그리지 않는다 */
  address?: string;
  frame: Win95WindowFrame;
  /** 맨 앞 창이면 제목줄을 주황으로, 아니면 회색으로 칠한다 */
  active: boolean;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onClose: () => void;
  onMinimize: () => void;
  /** 최소화된 창은 언마운트하지 않고 숨겨서 스크롤 위치와 내용 상태를 그대로 둔다 */
  minimized: boolean;
  /** 상태 표시줄 내용. 없으면 상태 표시줄을 그리지 않는다 */
  status?: React.ReactNode;
  children: React.ReactNode;
}

/** 창을 끝까지 밀어도 좌우로 남겨 두는 제목줄 너비(px). 이만큼은 보여야 다시 잡아 끌 수 있다 */
const GRAB_MARGIN = 80;
/** 제목줄 높이(px). 아래로 밀 때 제목줄이 바탕화면 밖으로 나가지 않게 하는 기준이다 */
const TITLE_BAR_HEIGHT = 22;

interface DragState {
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
  maxX: number;
  maxY: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function Win95Window({
  title,
  icon,
  address,
  frame,
  active,
  onFocus,
  onMove,
  onClose,
  onMinimize,
  minimized,
  status,
  children,
}: Win95WindowProps) {
  const frameRef = useRef<HTMLElement>(null);
  const drag = useRef<DragState | null>(null);

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('a, button')) return;
    const area = frameRef.current?.offsetParent?.getBoundingClientRect();
    if (!area) return;

    drag.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: frame.x,
      startY: frame.y,
      maxX: area.width - GRAB_MARGIN,
      maxY: area.height - TITLE_BAR_HEIGHT,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const moveDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    onMove(
      clamp(d.startX + e.clientX - d.pointerX, GRAB_MARGIN - frame.width, d.maxX),
      clamp(d.startY + e.clientY - d.pointerY, 0, d.maxY),
    );
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <section
      ref={frameRef}
      aria-label={title}
      onPointerDownCapture={onFocus}
      onFocusCapture={onFocus}
      // 위치·크기·쌓임 순서는 런타임 값이라 인라인 style로 준다. transform을 쓰면 창 안의 position: fixed
      // 요소가 창을 기준으로 잡히므로 left/top을 쓴다
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        zIndex: frame.z,
      }}
      className={`win-raised font-win absolute flex-col gap-0.5 p-[3px] text-xs text-black ${
        minimized ? 'hidden' : 'flex'
      }`}
    >
      <div
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`flex h-[22px] shrink-0 touch-none items-center gap-1.5 pr-[3px] pl-1 font-bold text-white select-none ${
          active ? 'win-titlebar' : 'win-titlebar-inactive'
        }`}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <Win95Button size="icon" onClick={onMinimize} aria-label={`${title} 최소화`} title="최소화">
          <Minus className="h-3 w-3 translate-y-[3px]" strokeWidth={3} />
        </Win95Button>
        <Win95Button
          size="icon"
          onClick={onClose}
          aria-label={`${title} 닫기`}
          title="닫기"
          className="ml-0.5"
        >
          <X className="h-3 w-3" strokeWidth={3} />
        </Win95Button>
      </div>

      {address && (
        <div className="border-win-shadow flex shrink-0 items-center gap-1.5 border-t px-1 py-1 shadow-[inset_0_1px_var(--color-white)]">
          <span className="shrink-0">주소</span>
          <div className="win-sunken flex h-[22px] min-w-0 flex-1 items-center gap-1.5 bg-white px-1.5">
            <FolderIcon size={16} />
            <span className="truncate">{address}</span>
          </div>
        </div>
      )}

      {/* 창 높이가 정해져 있으므로 넘치는 내용은 본문 안에서 스크롤한다 */}
      <div className="win-sunken win-scrollbar min-h-0 flex-1 overflow-y-auto bg-white p-[2px]">
        {children}
      </div>

      {status && <div className="win-sunken flex h-5 shrink-0 items-center px-1.5">{status}</div>}
    </section>
  );
}

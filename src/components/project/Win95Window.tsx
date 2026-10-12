/**
 * @file Win95Window.tsx
 * @description /portfolio 바탕화면의 Windows 95 창 하나. 제목줄·(폴더·문서면) 주소창·본문·상태 표시줄로 구성된다.
 *              위치·크기·쌓임 순서·최대화·확대 배율은 Win95WindowManager가 갖고, 이 컴포넌트는 그리기와
 *              제목줄 끌기·가장자리 크기 조절만 맡는다.
 *              compact(좁은 화면)에서는 앱 화면처럼 바탕화면을 꽉 채우고, 제목줄의 ← 버튼으로 닫는다.
 */

'use client';

import { ArrowLeft, Copy, Minus, Square, X } from 'lucide-react';
import { useRef, useState } from 'react';

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

export type Win95WindowRect = Pick<Win95WindowFrame, 'x' | 'y' | 'width' | 'height'>;

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
  /** 가장자리를 끌어 바꾼 위치와 크기 */
  onResize: (rect: Win95WindowRect) => void;
  onClose: () => void;
  onMinimize: () => void;
  /** 바탕화면을 꽉 채워 그린다. 이때는 끌기와 크기 조절을 막는다. compact에서는 쓰지 않는다 */
  maximized: boolean;
  onToggleMaximize: () => void;
  /** 본문 확대 배율(1 = 100%). fill 창에는 적용하지 않는다 */
  zoom: number;
  /** 최소화된 창은 언마운트하지 않고 숨겨서 스크롤 위치와 내용 상태를 그대로 둔다 */
  minimized: boolean;
  /** 내용이 본문을 꽉 채우는 창(게임 등). 스크롤하지 않고 바탕을 검게 칠하며 확대하지 않는다 */
  fill?: boolean;
  /** 상태 표시줄 내용. 없으면 상태 표시줄을 그리지 않는다 */
  status?: React.ReactNode;
  /** 좁은 화면용 배치. 끌기·최소화·주소창·상태 표시줄 없이 바탕화면을 꽉 채운다 */
  compact?: boolean;
  children: React.ReactNode;
}

/** 창을 끝까지 밀어도 좌우로 남겨 두는 제목줄 너비(px). 이만큼은 보여야 다시 잡아 끌 수 있다 */
const GRAB_MARGIN = 80;
/** 제목줄 높이(px). 아래로 밀 때 제목줄이 바탕화면 밖으로 나가지 않게 하는 기준이다 */
const TITLE_BAR_HEIGHT = 22;
/** 크기를 줄일 수 있는 한계(px) */
const MIN_WIDTH = 240;
const MIN_HEIGHT = 160;

interface DragState {
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
  maxX: number;
  maxY: number;
}

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** 손잡이 자리와 커서. 창 테두리에 반쯤 걸치게 두고, 모서리는 가장자리보다 나중에 그려 위에 오게 한다 */
const RESIZE_HANDLES: Record<ResizeEdge, string> = {
  n: '-top-1 inset-x-2 h-2 cursor-ns-resize',
  s: '-bottom-1 inset-x-2 h-2 cursor-ns-resize',
  e: '-right-1 inset-y-2 w-2 cursor-ew-resize',
  w: '-left-1 inset-y-2 w-2 cursor-ew-resize',
  ne: '-top-1 -right-1 size-3 cursor-nesw-resize',
  sw: '-bottom-1 -left-1 size-3 cursor-nesw-resize',
  nw: '-top-1 -left-1 size-3 cursor-nwse-resize',
  se: '-right-1 -bottom-1 size-3 cursor-nwse-resize',
};

interface ResizeState {
  edge: ResizeEdge;
  pointerX: number;
  pointerY: number;
  start: Win95WindowRect;
  areaWidth: number;
  areaHeight: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * 끌기 시작 시점의 프레임과 포인터 이동량으로 새 프레임을 만든다. 반대편 가장자리는 제자리에 두고
 * 바탕화면 밖으로는 늘리지 않는다. 이미 밖으로 나가 있던 창은 그 자리보다 더 줄이지 않는다.
 */
function resizeFrame(
  { edge, start, areaWidth, areaHeight }: ResizeState,
  dx: number,
  dy: number,
): Win95WindowRect {
  let { x, y, width, height } = start;
  if (edge.includes('e')) {
    width = clamp(start.width + dx, MIN_WIDTH, Math.max(start.width, areaWidth - start.x));
  }
  if (edge.includes('w')) {
    const right = start.x + start.width;
    x = clamp(start.x + dx, Math.min(start.x, 0), right - MIN_WIDTH);
    width = right - x;
  }
  if (edge.includes('s')) {
    height = clamp(start.height + dy, MIN_HEIGHT, Math.max(start.height, areaHeight - start.y));
  }
  if (edge.includes('n')) {
    const bottom = start.y + start.height;
    y = clamp(start.y + dy, 0, bottom - MIN_HEIGHT);
    height = bottom - y;
  }
  return { x, y, width, height };
}

export default function Win95Window({
  title,
  icon,
  address,
  frame,
  active,
  onFocus,
  onMove,
  onResize,
  onClose,
  onMinimize,
  maximized,
  onToggleMaximize,
  zoom,
  minimized,
  fill = false,
  status,
  compact = false,
  children,
}: Win95WindowProps) {
  const frameRef = useRef<HTMLElement>(null);
  const drag = useRef<DragState | null>(null);
  const resize = useRef<ResizeState | null>(null);
  const [resizing, setResizing] = useState(false);
  const filled = compact || maximized;

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (filled || e.button !== 0 || (e.target as HTMLElement).closest('a, button')) return;
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

  const startResize = (edge: ResizeEdge) => (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const area = frameRef.current?.offsetParent?.getBoundingClientRect();
    if (!area) return;

    resize.current = {
      edge,
      pointerX: e.clientX,
      pointerY: e.clientY,
      start: { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
      areaWidth: area.width,
      areaHeight: area.height,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
  };

  const moveResize = (e: PointerEvent<HTMLDivElement>) => {
    const r = resize.current;
    if (!r) return;
    onResize(resizeFrame(r, e.clientX - r.pointerX, e.clientY - r.pointerY));
  };

  const endResize = () => {
    resize.current = null;
    setResizing(false);
  };

  return (
    <section
      ref={frameRef}
      aria-label={title}
      onPointerDownCapture={onFocus}
      onFocusCapture={onFocus}
      // 위치·크기·쌓임 순서는 런타임 값이라 인라인 style로 준다. transform을 쓰면 창 안의 position: fixed
      // 요소가 창을 기준으로 잡히므로 left/top을 쓴다. 꽉 채울 때는 숫자 대신 inset-0을 써야 회전·크기 변경을 따라간다
      style={
        filled
          ? { zIndex: frame.z }
          : {
              left: frame.x,
              top: frame.y,
              width: frame.width,
              height: frame.height,
              zIndex: frame.z,
            }
      }
      className={`win-raised font-win absolute flex-col gap-0.5 p-[3px] text-xs text-black ${
        minimized ? 'hidden' : 'flex'
      } ${filled ? 'inset-0' : ''}`}
    >
      <div
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(e) => {
          if (!compact && !(e.target as HTMLElement).closest('a, button')) onToggleMaximize();
        }}
        className={`flex shrink-0 touch-none items-center gap-1.5 pr-[3px] pl-1 font-bold text-white select-none ${
          compact ? 'h-11' : 'h-[22px]'
        } ${active ? 'win-titlebar' : 'win-titlebar-inactive'}`}
      >
        {compact ? (
          <Win95Button
            size="touch"
            onClick={onClose}
            aria-label={`${title} 닫고 뒤로 가기`}
            title="뒤로"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={3} />
          </Win95Button>
        ) : (
          icon
        )}
        <span className="min-w-0 flex-1 truncate">{title}</span>
        {!compact && (
          <>
            <Win95Button
              size="icon"
              onClick={onMinimize}
              aria-label={`${title} 최소화`}
              title="최소화"
            >
              <Minus className="h-3 w-3 translate-y-[3px]" strokeWidth={3} />
            </Win95Button>
            <Win95Button
              size="icon"
              onClick={onToggleMaximize}
              aria-label={`${title} ${maximized ? '이전 크기로' : '최대화'}`}
              title={maximized ? '이전 크기로' : '최대화'}
            >
              {maximized ? (
                <Copy className="h-2.5 w-2.5" strokeWidth={3} />
              ) : (
                <Square className="h-2.5 w-2.5" strokeWidth={3} />
              )}
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
          </>
        )}
      </div>

      {address && !compact && (
        <div className="border-win-shadow flex shrink-0 items-center gap-1.5 border-t px-1 py-1 shadow-[inset_0_1px_var(--color-white)]">
          <span className="shrink-0">주소</span>
          <div className="win-sunken flex h-[22px] min-w-0 flex-1 items-center gap-1.5 bg-white px-1.5">
            <FolderIcon size={16} />
            <span className="truncate">{address}</span>
          </div>
        </div>
      )}

      {/* 창 높이가 정해져 있으므로 넘치는 내용은 본문 안에서 스크롤한다.
          크기를 조절하는 동안에는 본문이 포인터를 받지 않게 한다. 커서가 iframe(게임) 위로 들어가면 끌기가 끊긴다 */}
      <div
        className={`win-sunken min-h-0 flex-1 p-[2px] ${
          fill ? 'overflow-hidden bg-black' : 'win-scrollbar overflow-y-auto bg-white'
        } ${resizing ? 'pointer-events-none' : ''}`}
      >
        {fill ? (
          children
        ) : (
          // zoom은 font-size와 달리 글자·mermaid 도표·이미지를 같은 비율로 키우고, transform과 달리 흐려지지 않는다
          <div style={{ zoom }}>{children}</div>
        )}
      </div>

      {status && !compact && (
        <div className="win-sunken flex h-5 shrink-0 items-center px-1.5">{status}</div>
      )}

      {!filled &&
        (Object.keys(RESIZE_HANDLES) as ResizeEdge[]).map((edge) => (
          <div
            key={edge}
            aria-hidden
            onPointerDown={startResize(edge)}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            className={`absolute z-10 touch-none ${RESIZE_HANDLES[edge]}`}
          />
        ))}
    </section>
  );
}

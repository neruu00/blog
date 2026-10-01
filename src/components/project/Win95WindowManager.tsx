/**
 * @file Win95WindowManager.tsx
 * @description /portfolio 바탕화면. 바탕화면 아이콘·창 여러 개·작업 표시줄을 그리고, 어떤 창이 열려 있는지와
 *              각 창의 위치·크기·쌓임 순서를 관리한다. 창은 실제 경로가 아니라 가상 경로(id)로 연다.
 *              /portfolio?open=project/secome처럼 open 파라미터를 주면 들어오자마자 그 창을 연다.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Win95IconButton from '@/components/project/Win95IconButton';
import Win95Taskbar from '@/components/project/Win95Taskbar';
import Win95Window from '@/components/project/Win95Window';
import type { Win95WindowFrame } from '@/components/project/Win95Window';
import { Win95WindowsContext } from '@/hooks/useWin95Windows';

export interface Win95WindowDef {
  /** 가상 경로. 예: about, project, project/secome */
  id: string;
  title: string;
  /** 제목줄·작업 표시줄의 16px 아이콘 */
  icon: React.ReactNode;
  /** 주소창을 그린다. 주소는 가상 경로에서 만든다(project/secome → C:\project\secome) */
  showAddress?: boolean;
  status?: React.ReactNode;
  /** 처음 열 때의 크기(px). 바탕화면보다 크면 바탕화면에 맞춰 줄인다 */
  width: number;
  height: number;
  content: React.ReactNode;
}

export interface Win95DesktopIconDef {
  /** 클릭하면 여는 창의 id */
  id: string;
  label: string;
  /** 48px 아이콘 */
  icon: React.ReactNode;
}

interface Win95WindowManagerProps {
  windows: Win95WindowDef[];
  desktopIcons: Win95DesktopIconDef[];
  github: string;
  email: string;
}

interface OpenWindow extends Win95WindowFrame {
  id: string;
  minimized: boolean;
}

/** 창과 바탕화면 가장자리 사이 최소 간격(px) */
const EDGE = 8;
/** 창을 연달아 열 때 하나씩 비켜 놓는 거리(px) */
const CASCADE = 28;
/** 이 너비보다 좁은 화면에서는 창을 바탕화면에 꽉 채워 연다 */
const COMPACT_WIDTH = 640;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** 가상 경로를 주소창에 보일 Windows 경로로 바꾼다. 예: project/secome → C:\project\secome */
const toAddress = (id: string) => `C:\\${id.replaceAll('/', '\\')}`;

/** 새 창의 자리. 가운데를 기준으로 열린 창 수만큼 비켜 놓고, 바탕화면을 넘지 않게 크기를 줄인다 */
function placeWindow(def: Win95WindowDef, area: DOMRect, openCount: number) {
  if (area.width < COMPACT_WIDTH) {
    return { x: EDGE / 2, y: EDGE / 2, width: area.width - EDGE, height: area.height - EDGE };
  }
  const width = Math.min(def.width, area.width - EDGE * 2);
  const height = Math.min(def.height, area.height - EDGE * 2);
  const step = (openCount % 6) * CASCADE;
  return {
    x: clamp((area.width - width) / 2 + step, EDGE, area.width - width - EDGE),
    y: clamp((area.height - height) / 2 + step, EDGE, area.height - height - EDGE),
    width,
    height,
  };
}

export default function Win95WindowManager({
  windows,
  desktopIcons,
  github,
  email,
}: Win95WindowManagerProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const topZ = useRef(0);
  const [opened, setOpened] = useState<OpenWindow[]>([]);
  const defs = useMemo(() => new Map(windows.map((def) => [def.id, def])), [windows]);

  /** 맨 앞으로 가져온다. 최소화돼 있었다면 다시 띄운다 */
  const focus = useCallback((id: string) => {
    setOpened((list) => {
      const target = list.find((w) => w.id === id);
      if (!target || (!target.minimized && target.z === topZ.current)) return list;
      topZ.current += 1;
      return list.map((w) => (w.id === id ? { ...w, z: topZ.current, minimized: false } : w));
    });
  }, []);

  const open = useCallback(
    (id: string) => {
      const def = defs.get(id);
      const area = areaRef.current?.getBoundingClientRect();
      if (!def || !area) return;
      setOpened((list) => {
        topZ.current += 1;
        if (list.some((w) => w.id === id)) {
          return list.map((w) => (w.id === id ? { ...w, z: topZ.current, minimized: false } : w));
        }
        return [
          ...list,
          { id, z: topZ.current, minimized: false, ...placeWindow(def, area, list.length) },
        ];
      });
    },
    [defs],
  );

  const close = useCallback((id: string) => {
    setOpened((list) => list.filter((w) => w.id !== id));
  }, []);

  const minimize = useCallback((id: string) => {
    setOpened((list) => list.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }, []);

  const move = useCallback((id: string, x: number, y: number) => {
    setOpened((list) => list.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  // 정적 페이지라 searchParams 대신 마운트한 뒤 주소에서 직접 읽는다
  useEffect(() => {
    new URLSearchParams(window.location.search)
      .getAll('open')
      .flatMap((value) => value.split(','))
      .forEach(open);
  }, [open]);

  const actions = useMemo(() => ({ open, close, focus }), [open, close, focus]);
  // 최소화된 창은 맨 앞 창이 될 수 없다
  const activeId = opened.reduce<OpenWindow | null>(
    (top, w) => (!w.minimized && (!top || w.z > top.z) ? w : top),
    null,
  )?.id;

  /** Windows 95처럼 맨 앞 창의 작업 표시줄 버튼을 누르면 최소화하고, 그 밖의 창은 맨 앞으로 가져온다 */
  const toggleTask = (id: string) => (id === activeId ? minimize(id) : focus(id));

  return (
    <Win95WindowsContext value={actions}>
      {/* 작업 표시줄(h-10) 위가 바탕화면이다. 바탕화면 밖으로 끌려 나간 창은 잘라 낸다 */}
      <div ref={areaRef} className="absolute inset-x-0 top-0 bottom-10 overflow-hidden">
        <nav
          aria-label="바탕화면"
          className="absolute top-2 left-2 flex flex-col gap-3 sm:top-8 sm:left-4"
        >
          {desktopIcons.map((icon) => (
            <Win95IconButton
              key={icon.id}
              icon={icon.icon}
              label={icon.label}
              onClick={() => open(icon.id)}
            />
          ))}
        </nav>

        {opened.map((w) => {
          const def = defs.get(w.id);
          if (!def) return null;
          return (
            <Win95Window
              key={w.id}
              title={def.title}
              icon={def.icon}
              address={def.showAddress ? toAddress(def.id) : undefined}
              status={def.status}
              frame={w}
              active={w.id === activeId}
              onFocus={() => focus(w.id)}
              onMove={(x, y) => move(w.id, x, y)}
              onClose={() => close(w.id)}
              onMinimize={() => minimize(w.id)}
              minimized={w.minimized}
            >
              {def.content}
            </Win95Window>
          );
        })}
      </div>

      <Win95Taskbar
        tasks={opened.map((w) => ({
          id: w.id,
          title: defs.get(w.id)?.title ?? w.id,
          icon: defs.get(w.id)?.icon,
          active: w.id === activeId,
        }))}
        onTaskClick={toggleTask}
        github={github}
        email={email}
      />
    </Win95WindowsContext>
  );
}

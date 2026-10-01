/**
 * @file ProjectAppGrid.tsx
 * @description project 폴더 창 안의 프로젝트 앱 아이콘 목록. 아이콘을 클릭하면 프로젝트 문서를 연다.
 *              마우스를 올리면 대표 캡처·기간·주장을 담은 미리 보기 대화상자가 커서를 따라다닌다.
 *              키보드로 포커스하면 아이콘 옆에 고정해서 띄우고, 호버가 없는 터치에서는 띄우지 않는다.
 */

'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import ProjectThumbnail from '@/components/project/ProjectThumbnail';
import Win95IconLink from '@/components/project/Win95IconLink';
import { ProjectAppGlyph } from '@/components/project/Win95Icons';
import type { Project } from '@/lib/constants/portfolio';

/** 클라이언트 번들에 portfolio.ts 전체가 실리지 않도록 미리 보기에 필요한 필드만 받는다 */
export type ProjectApp = Pick<Project, 'slug' | 'name' | 'nameEn' | 'period' | 'claim' | 'cover'>;

interface ProjectAppGridProps {
  apps: ProjectApp[];
}

/** 커서와 대화상자 사이 간격(px) */
const CURSOR_GAP = 16;

export default function ProjectAppGrid({ apps }: ProjectAppGridProps) {
  const [active, setActive] = useState<ProjectApp | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const anchor = useRef({ x: 0, y: 0 });

  /** 기준점 오른쪽 아래에 띄우고, 화면 밖으로 나가면 반대쪽으로 뒤집는다. 매 프레임 렌더링하지 않도록 DOM에 바로 쓴다 */
  const place = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const { width, height } = dialog.getBoundingClientRect();
    const { x, y } = anchor.current;
    const left =
      x + CURSOR_GAP + width > window.innerWidth ? x - CURSOR_GAP - width : x + CURSOR_GAP;
    const top =
      y + CURSOR_GAP + height > window.innerHeight ? y - CURSOR_GAP - height : y + CURSOR_GAP;
    dialog.style.transform = `translate(${Math.max(0, left)}px, ${Math.max(0, top)}px)`;
  }, []);

  // 대화상자 내용이 바뀌면 크기도 바뀌므로 그린 직후 다시 자리를 잡는다
  useLayoutEffect(place, [active, place]);

  return (
    <>
      <ul className="flex flex-wrap gap-2 p-4">
        {apps.map((app) => (
          <li key={app.slug}>
            <Win95IconLink
              href={`/portfolio/project/${app.slug}`}
              icon={<ProjectAppGlyph size={48} letter={app.nameEn.charAt(0)} />}
              label={app.name}
              aria-describedby={`app-${app.slug}-claim`}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse') return;
                anchor.current = { x: e.clientX, y: e.clientY };
                setActive(app);
              }}
              onPointerMove={(e) => {
                if (e.pointerType !== 'mouse') return;
                anchor.current = { x: e.clientX, y: e.clientY };
                place();
              }}
              onPointerLeave={() => setActive(null)}
              onFocus={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                anchor.current = { x: rect.right, y: rect.top };
                setActive(app);
              }}
              onBlur={() => setActive(null)}
            />
            <span id={`app-${app.slug}-claim`} className="sr-only">
              {app.claim}
            </span>
          </li>
        ))}
      </ul>

      {/* 아이콘 설명은 aria-describedby로 읽히므로 대화상자는 보조기기에서 숨긴다 */}
      <div
        ref={dialogRef}
        aria-hidden
        className={`win-raised font-win pointer-events-none fixed top-0 left-0 z-50 w-72 p-[3px] text-xs text-black ${active ? 'visible' : 'invisible'}`}
      >
        {active && (
          <>
            <div className="win-titlebar flex h-5 items-center gap-1.5 px-1 font-bold text-white">
              <ProjectAppGlyph size={16} letter={active.nameEn.charAt(0)} />
              <span className="truncate">{active.name}</span>
            </div>
            <div className="flex flex-col gap-2 p-2">
              <div className="win-sunken bg-win-face p-[2px]">
                <ProjectThumbnail key={active.slug} media={active.cover} sizes="288px" />
              </div>
              <p>
                <span className="font-bold">{active.nameEn}</span> · {active.period}
              </p>
              <p className="leading-relaxed">{active.claim}</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

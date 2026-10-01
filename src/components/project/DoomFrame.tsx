/**
 * @file DoomFrame.tsx
 * @description /portfolio 바탕화면 DOOM 창의 내용. 게임은 public/doom/index.html을 iframe으로 띄워 돌린다.
 *              iframe은 창 본문을 꽉 채우고, 게임 화면 비율(8:5)은 iframe 안의 canvas가 object-fit: contain으로 지킨다.
 *              iframe 안의 클릭은 바깥 문서로 전달되지 않으므로, 게임 화면에 포커스가 들어가면 창을 직접 맨 앞으로 가져온다.
 */

'use client';

import { useEffect, useRef } from 'react';

import { useWin95Windows } from '@/hooks/useWin95Windows';

interface DoomFrameProps {
  /** 이 iframe을 담은 창의 가상 경로 */
  windowId: string;
}

export default function DoomFrame({ windowId }: DoomFrameProps) {
  const { focus } = useWin95Windows();
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // iframe으로 포커스가 넘어가면 바깥 window에서 blur가 일어난다
    const onBlur = () => {
      if (document.activeElement === frameRef.current) focus(windowId);
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [focus, windowId]);

  return (
    <iframe
      ref={frameRef}
      src="/doom/index.html"
      title="DOOM"
      // 게임 스크립트만 허용하고 블로그 문서·쿠키에는 접근하지 못하게 한다
      sandbox="allow-scripts"
      className="block h-full w-full bg-black"
    />
  );
}

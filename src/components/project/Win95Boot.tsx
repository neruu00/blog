/**
 * @file Win95Boot.tsx
 * @description /portfolio에 들어올 때 바탕화면을 덮는 부팅 화면. 칸 단위로 차오르는 진행 막대가 끝나면 사라진다.
 *              (portfolio) 레이아웃에 있어서 블로그에서 넘어올 때만 다시 마운트되고, 포트폴리오 안에서 창을 오갈 때는 나오지 않는다.
 */

'use client';

import { useEffect, useState } from 'react';

import { ProfileAppIcon } from '@/components/project/Win95Icons';

/** 진행 막대의 칸 수. globals.css의 win-boot 애니메이션 steps()와 같아야 칸 경계에 맞춰 차오른다 */
const BLOCKS = 20;

export default function Win95Boot() {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle');

  // 하이드레이션 전에 애니메이션이 끝나면 onAnimationEnd를 놓쳐 화면이 영영 덮이므로, 마운트한 뒤에 시작한다
  useEffect(() => setPhase('loading'), []);

  if (phase === 'done') return null;

  return (
    <div
      data-win-boot
      role="status"
      aria-label="포트폴리오를 여는 중"
      className="bg-win-desktop font-win fixed inset-0 z-50 flex items-center justify-center p-4 text-xs text-black"
    >
      <div className="win-raised w-full max-w-sm p-[3px]">
        <div className="win-titlebar flex h-[22px] items-center px-1.5 font-bold text-white">
          neru.win
        </div>
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-3">
            <ProfileAppIcon size={32} />
            <p>포트폴리오를 여는 중...</p>
          </div>
          <div className="win-sunken h-6 bg-white p-[3px]">
            <div
              className={`flex h-full gap-[2px] ${phase === 'loading' ? 'animate-win-boot' : 'invisible'}`}
              onAnimationEnd={() => setPhase('done')}
            >
              {Array.from({ length: BLOCKS }, (_, i) => (
                <span key={i} className="bg-win-title h-full flex-1" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

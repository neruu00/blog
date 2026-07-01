'use client';

import { useEffect, useRef, useState } from 'react';

export default function EyePoster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftEyePos, setLeftEyePos] = useState({ x: 0, y: 0 });
  const [rightEyePos, setRightEyePos] = useState({ x: 0, y: 0 });

  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const getEyeOffset = (eyeRef: React.RefObject<HTMLDivElement | null>) => {
        if (!eyeRef.current) return { x: 0, y: 0 };
        const rect = eyeRef.current.getBoundingClientRect();

        // 각 눈의 실제 중심값
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const angle = Math.atan2(dy, dx);

        // 눈동자가 움직일 수 있는 최대 반경 (2px)
        const distance = Math.min(Math.hypot(dx, dy) * 0.05, 2);

        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
        };
      };

      setLeftEyePos(getEyeOffset(leftEyeRef));
      setRightEyePos(getEyeOffset(rightEyeRef));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-64 flex-col items-center justify-between overflow-hidden rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-sm select-none"
    >
      <div className="mt-4 flex gap-6">
        <svg className="absolute h-0 w-0">
          <defs>
            {/* 눈 모양 클리핑 패스 (가로 60, 세로 35 기준 뾰족한 아몬드 곡선) */}
            <clipPath id="eye-clip">
              <path d="M 0 17.5 C 15 0, 45 0, 60 17.5 C 45 35, 15 35, 0 17.5 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* 왼쪽 눈 */}
        <div ref={leftEyeRef} className="relative h-[35px] w-[60px]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 60 35">
            <path
              d="M 0 17.5 C 15 0, 45 0, 60 17.5 C 45 35, 15 35, 0 17.5 Z"
              fill="#f9fafb"
              stroke="black"
              strokeWidth="3.5"
            />
          </svg>
          {/* 마스킹된 고정 영역 */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'url(#eye-clip)',
            }}
          >
            {/* 눈동자 (실제 움직이는 타겟) */}
            <div
              className="absolute top-[1.5px] left-[14px] flex size-8 items-center justify-center rounded-full bg-black transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${leftEyePos.x}px, ${leftEyePos.y}px)`,
              }}
            >
              {/* 안쪽 흰 동공 */}
              <div className="size-3 rounded-full bg-gray-50" />
            </div>
          </div>
        </div>

        {/* 오른쪽 눈 */}
        <div ref={rightEyeRef} className="relative h-[35px] w-[60px]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 60 35">
            <path
              d="M 0 17.5 C 15 0, 45 0, 60 17.5 C 45 35, 15 35, 0 17.5 Z"
              fill="#f9fafb"
              stroke="black"
              strokeWidth="3.5"
            />
          </svg>
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'url(#eye-clip)',
            }}
          >
            <div
              className="absolute top-[1.5px] left-[14px] flex size-8 items-center justify-center rounded-full bg-black transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${rightEyePos.x}px, ${rightEyePos.y}px)`,
              }}
            >
              <div className="size-3 rounded-full bg-gray-50" />
            </div>
          </div>
        </div>
      </div>

      {/* 한자 및 텍스트 문구 */}
      <div className="mb-2 flex flex-col items-center text-center font-sans">
        <span className="text-2xl font-black tracking-widest text-black">防犯カメラ</span>
        <span className="mt-1 text-xl font-black tracking-widest text-red-600">作動中 !</span>
        <span className="mt-2 text-[8px] font-bold tracking-tight text-gray-500 uppercase">
          Security camera in operation
        </span>
      </div>
    </div>
  );
}

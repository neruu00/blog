// src/components/ui/Tooltip.tsx
import { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode; // 툴팁을 띄울 타겟 요소 (버튼, 아이콘 등)
  content: string | ReactNode; // 툴팁 안에 들어갈 텍스트나 내용
  position?: 'top' | 'bottom'; // 툴팁이 뜰 위치 (기본값: top)
}

export default function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  // 위치에 따른 Tailwind 클래스 설정
  const isTop = position === 'top';

  const positionClasses = isTop
    ? 'bottom-full mb-2' // 위쪽: 타겟 요소의 위로 밀어올리고 마진
    : 'top-full mt-2'; // 아래쪽: 타겟 요소의 아래로 내리고 마진

  const arrowClasses = isTop
    ? 'top-full border-t-neutral-800 dark:border-t-neutral-700' // 위쪽 툴팁은 화살표가 아래를 향함
    : 'bottom-full border-b-neutral-800 dark:border-b-neutral-700'; // 아래쪽 툴팁은 화살표가 위를 향함

  return (
    // 1. 래퍼에 group 클래스를 주어 내부 요소들이 호버 상태를 공유하게 합니다.
    <div className="relative inline-block group">
      {/* 2. 사용자가 마우스를 올릴 실제 요소 */}
      {children}

      {/* 3. 툴팁 본문 (기본적으로 투명하고 약간 아래에 위치) */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${positionClasses} z-50 w-max pointer-events-none`}
      >
        {/* 애니메이션 효과: 투명도(opacity)와 Y축 이동(translate) */}
        <div
          className={`
          invisible opacity-0 translate-y-1 
          group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 
          transition-all duration-200 ease-out
          px-3 py-1.5 bg-neutral-800 dark:bg-neutral-700 text-white text-xs font-medium rounded-lg shadow-lg
        `}
        >
          {content}

          {/* 4. 툴팁 꼬리 (말풍선 화살표) */}
          <div
            className={`
            absolute left-1/2 -translate-x-1/2 border-[5px] border-transparent ${arrowClasses}
          `}
          />
        </div>
      </div>
    </div>
  );
}

import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string; // wrapper 래퍼에 추가할 클래스 (예: fixed 포지셔닝 등)
}

export default function Tooltip({
  children,
  text,
  position = 'top',
  className = '',
}: TooltipProps) {
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className={`group relative flex items-center justify-center ${className}`}>
      {children}
      <div
        className={`pointer-events-none absolute z-50 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 ${positionClasses[position]}`}
      >
        {text}
      </div>
    </div>
  );
}

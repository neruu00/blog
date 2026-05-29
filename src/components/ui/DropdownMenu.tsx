/**
 * @file DropdownMenu.tsx
 * @description 재사용 가능한 드롭다운 메뉴 UI 프리미티브.
 *              트리거 버튼과 오버레이 패널을 조합하여 드롭다운 패턴을 추상화한다.
 */

'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';

// ---- Context ---------------------------------------------------------------

interface DropdownContextValue {
  isOpen: boolean;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('DropdownMenu.Item must be used inside DropdownMenu');
  return ctx;
}

// ---- Item ------------------------------------------------------------------

interface ItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

function Item({ children, onClick, icon, className = '' }: ItemProps) {
  const { close } = useDropdownContext();

  const handleClick = () => {
    close();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600 ${className}`}
    >
      {icon && <span className="h-4 w-4 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// ---- Root ------------------------------------------------------------------

interface DropdownMenuProps {
  /** 드롭다운을 열고 닫는 트리거 요소 */
  trigger: React.ReactNode;
  children: React.ReactNode;
  /** 패널 정렬 방향 (기본값: 'right') */
  align?: 'left' | 'right';
  /** 패널이 트리거 위/아래에 표시될 방향 (기본값: 'down') */
  direction?: 'up' | 'down';
  className?: string;
}

export default function DropdownMenu({
  trigger,
  children,
  align = 'right',
  direction = 'down',
  className = '',
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  // 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Escape 키 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const alignClass = align === 'right' ? 'right-0' : 'left-0';
  const directionClass = direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <DropdownContext.Provider value={{ isOpen, close }}>
      <div ref={containerRef} className={`relative ${className}`}>
        {/* 트리거 */}
        <div onClick={toggle} role="button" aria-expanded={isOpen}>
          {trigger}
        </div>

        {/* 드롭다운 패널 */}
        {isOpen && (
          <div
            className={`absolute ${alignClass} ${directionClass} z-50 min-w-[180px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl`}
          >
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
}

DropdownMenu.Item = Item;

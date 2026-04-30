'use client';

import { useEffect, useRef } from 'react';

import { useModalStore } from '@/stores/useModalStore';

export default function Modal() {
  const { isOpen, content, close } = useModalStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 현재 포커스된 요소 저장
      previousFocusRef.current = document.activeElement as HTMLElement;
      // 스크롤 잠금
      document.body.style.overflow = 'hidden';
      // 모달에 포커스 주기 (잠시 후 실행하여 렌더링 완료 보장)
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 0);

      // ESC 키 이벤트 핸들러
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close();
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
        // 이전 포커스 복원
        previousFocusRef.current?.focus();
        clearTimeout(timer);
      };
    }
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* 모달 컨텐츠 */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl focus:outline-none dark:border-neutral-800 dark:bg-neutral-900"
      >
        {content}
      </div>
    </div>
  );
}

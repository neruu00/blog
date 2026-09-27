'use client';

import { useEffect, useRef } from 'react';

import { useModalStore } from '@/stores/useModalStore';

export default function Modal() {
  const { isOpen, content, close } = useModalStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 닫을 때 포커스를 되돌릴 수 있도록 현재 포커스 요소를 저장한다
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      // 렌더링이 끝난 뒤 포커스를 옮기도록 다음 틱으로 미룬다
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 0);

      // ESC로 닫고, Tab 포커스가 모달 밖으로 나가지 않게 가둔다
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
        previousFocusRef.current?.focus();
        clearTimeout(timer);
      };
    }
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl focus:outline-none"
      >
        {content}
      </div>
    </div>
  );
}

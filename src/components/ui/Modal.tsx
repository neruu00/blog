'use client';

import { useModalStore } from '@/stores/useModalStore';

export default function Modal() {
  const { isOpen, content, close } = useModalStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

      {/* 모달 컨텐츠 */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        {content}
      </div>
    </div>
  );
}

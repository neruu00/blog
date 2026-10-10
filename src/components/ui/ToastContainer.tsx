'use client';

import { X } from 'lucide-react';

import Button from '@/components/ui/Button';
import { useToastStore } from '@/stores/useToastStore';

const TOAST_STYLES = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-orange-200 bg-orange-50 text-orange-800',
} as const;

const TOAST_ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
} as const;

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    // 모바일은 상단 헤더 아래 전체 폭, md 이상은 오른쪽 아래 FAB 열의 왼쪽에 띄운다
    <div className="inset-x-float top-below-header md:right-beside-fab md:bottom-float fixed z-[100] flex flex-col gap-3 md:inset-x-auto md:top-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-in flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${TOAST_STYLES[toast.type]}`}
          role="alert"
        >
          <span className="text-base leading-none font-bold">{TOAST_ICONS[toast.type]}</span>
          <p className="text-sm font-medium">{toast.message}</p>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 h-6 w-6 shrink-0 rounded-full text-inherit hover:bg-black/10 hover:text-inherit"
            onClick={() => removeToast(toast.id)}
            aria-label="알림 닫기"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}

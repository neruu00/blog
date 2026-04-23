'use client';

import { X } from 'lucide-react';

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
    <div className="fixed right-6 bottom-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-in flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${TOAST_STYLES[toast.type]}`}
          role="alert"
        >
          <span className="text-base leading-none font-bold">{TOAST_ICONS[toast.type]}</span>
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 shrink-0 rounded-full p-0.5 transition-colors hover:bg-black/10"
            aria-label="알림 닫기"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

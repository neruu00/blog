/**
 * @file useToastStore.ts
 * @description 전역 토스트 알림 상태를 관리하는 Zustand 스토어.
 */

import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  /** 토스트 고유 ID */
  id: string;
  /** 토스트 메시지 */
  message: string;
  /** 토스트 종류 */
  type: ToastType;
}

interface ToastState {
  /** 현재 표시 중인 토스트 목록 */
  toasts: Toast[];
  /** 토스트 추가 (3초 후 자동 제거) */
  addToast: (message: string, type?: ToastType) => void;
  /** 특정 토스트 제거 */
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    // 3초 후 자동 제거
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

/**
 * @file useModalStore.ts
 * @description 전역 모달의 열림 상태와 표시할 내용을 담는 스토어. `Modal`이 구독한다.
 */

import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  content: React.ReactNode | null;
  open: (content: React.ReactNode) => void;
  close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  content: null,
  open: (content) => set({ isOpen: true, content }),
  close: () => set({ isOpen: false, content: null }),
}));

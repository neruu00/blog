/**
 * @file useModalStore.ts
 * @description 전역 모달 상태를 관리하는 Zustand 스토어.
 *              앱 전체에서 모달의 열림/닫힘 상태와 콘텐츠를 제어한다.
 */

import { create } from 'zustand';

interface ModalState {
  /** 모달 열림 여부 */
  isOpen: boolean;
  /** 모달에 표시할 콘텐츠 */
  content: React.ReactNode | null;
  /** 모달 열기 */
  open: (content: React.ReactNode) => void;
  /** 모달 닫기 */
  close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  content: null,
  open: (content) => set({ isOpen: true, content }),
  close: () => set({ isOpen: false, content: null }),
}));

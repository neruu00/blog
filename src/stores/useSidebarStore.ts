/**
 * @file useSidebarStore.ts
 * @description 모바일 사이드바(햄버거 메뉴) 상태를 관리하는 Zustand 스토어.
 */

import { create } from 'zustand';

interface SidebarState {
  /** 사이드바 열림 여부 */
  isOpen: boolean;
  /** 사이드바 열기 */
  open: () => void;
  /** 사이드바 닫기 */
  close: () => void;
  /** 사이드바 토글 */
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

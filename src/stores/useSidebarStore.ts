/**
 * @file useSidebarStore.ts
 * @description 모바일 햄버거 메뉴의 열림 상태를 담는 스토어.
 */

import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

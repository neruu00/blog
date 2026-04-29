/**
 * @file useLikeStore.ts
 * @description 좋아요 등의 비동기 요청 중인 상태를 전역적으로 관리하는 Zustand 스토어.
 *              연타 방지 및 동시성 제어 목적으로 사용.
 */

import { create } from 'zustand';

interface LikeState {
  /** 현재 좋아요 변경 요청이 진행 중인 게시글 ID들의 Set */
  pendingLikes: Set<string>;
  /** 특정 게시글의 좋아요 진행 상태를 변경 */
  setPendingLike: (postId: string, isPending: boolean) => void;
}

export const useLikeStore = create<LikeState>((set) => ({
  pendingLikes: new Set(),
  setPendingLike: (postId, isPending) =>
    set((state) => {
      const newPending = new Set(state.pendingLikes);
      if (isPending) {
        newPending.add(postId);
      } else {
        newPending.delete(postId);
      }
      return { pendingLikes: newPending };
    }),
}));

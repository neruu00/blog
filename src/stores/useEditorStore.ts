/**
 * @file useEditorStore.ts
 * @description 게시글 작성·수정 화면의 제목·본문·태그·시리즈와 제출 상태를 담는 스토어.
 */

import { JSONContent } from '@tiptap/react';
import { create } from 'zustand';

interface EditorInitialData {
  title?: string;
  content?: JSONContent | null;
  tags?: string[];
  seriesTitle?: string;
  seriesOrder?: number | null;
}

interface EditorState {
  title: string;
  content: JSONContent | null;
  tags: string[];
  /** 빈 문자열이면 시리즈에 넣지 않는다 */
  seriesTitle: string;
  /** null이면 저장할 때 서버가 순서를 정한다 */
  seriesOrder: number | null;
  isSubmitting: boolean;
  editorKey: number;

  setTitle: (title: string) => void;
  setContent: (content: JSONContent | null) => void;
  setTags: (tags: string[] | ((prev: string[]) => string[])) => void;
  setSeriesTitle: (seriesTitle: string) => void;
  setSeriesOrder: (seriesOrder: number | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  incrementEditorKey: () => void;
  setInitialData: (data: EditorInitialData) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  title: '',
  content: null,
  tags: [],
  seriesTitle: '',
  seriesOrder: null,
  isSubmitting: false,
  editorKey: 0,

  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setTags: (tags) =>
    set((state) => ({ tags: typeof tags === 'function' ? tags(state.tags) : tags })),
  setSeriesTitle: (seriesTitle) => set({ seriesTitle }),
  setSeriesOrder: (seriesOrder) => set({ seriesOrder }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  incrementEditorKey: () => set((state) => ({ editorKey: state.editorKey + 1 })),
  setInitialData: (data) =>
    set((state) => ({
      title: data.title || '',
      content: data.content || null,
      tags: data.tags || [],
      seriesTitle: data.seriesTitle || '',
      seriesOrder: data.seriesOrder ?? null,
      editorKey: state.editorKey + 1,
    })),
  reset: () =>
    set({
      title: '',
      content: null,
      tags: [],
      seriesTitle: '',
      seriesOrder: null,
      isSubmitting: false,
      editorKey: 0,
    }),
}));

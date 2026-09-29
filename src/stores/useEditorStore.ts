/**
 * @file useEditorStore.ts
 * @description 게시글 작성·수정 화면의 제목·본문·태그·시리즈와 제출 상태를 담는 스토어.
 */

import { JSONContent } from '@tiptap/react';
import { create } from 'zustand';

/** 이 글의 시리즈 선택. 글을 저장할 때 서버에 넘긴다. */
export interface SeriesSelection {
  /** 기존 시리즈 id. `newSeriesTitle`과 동시에 채우지 않는다 */
  seriesId: string | null;
  /** 저장할 때 만들 새 시리즈 이름. 빈 문자열이면 새로 만들지 않는다 */
  newSeriesTitle: string;
  /** 시리즈 안 위치. `first`면 맨 앞, 글 id면 그 글 뒤, null이면 서버가 정한다 */
  seriesAfter: string | null;
}

export const EMPTY_SERIES_SELECTION: SeriesSelection = {
  seriesId: null,
  newSeriesTitle: '',
  seriesAfter: null,
};

interface EditorInitialData {
  title?: string;
  content?: JSONContent | null;
  tags?: string[];
  seriesId?: string | null;
}

interface EditorState {
  title: string;
  content: JSONContent | null;
  tags: string[];
  series: SeriesSelection;
  isSubmitting: boolean;
  editorKey: number;

  setTitle: (title: string) => void;
  setContent: (content: JSONContent | null) => void;
  setTags: (tags: string[] | ((prev: string[]) => string[])) => void;
  setSeries: (series: SeriesSelection) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  incrementEditorKey: () => void;
  setInitialData: (data: EditorInitialData) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  title: '',
  content: null,
  tags: [],
  series: EMPTY_SERIES_SELECTION,
  isSubmitting: false,
  editorKey: 0,

  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setTags: (tags) =>
    set((state) => ({ tags: typeof tags === 'function' ? tags(state.tags) : tags })),
  setSeries: (series) => set({ series }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  incrementEditorKey: () => set((state) => ({ editorKey: state.editorKey + 1 })),
  setInitialData: (data) =>
    set((state) => ({
      title: data.title || '',
      content: data.content || null,
      tags: data.tags || [],
      series: { ...EMPTY_SERIES_SELECTION, seriesId: data.seriesId ?? null },
      editorKey: state.editorKey + 1,
    })),
  reset: () =>
    set({
      title: '',
      content: null,
      tags: [],
      series: EMPTY_SERIES_SELECTION,
      isSubmitting: false,
      editorKey: 0,
    }),
}));

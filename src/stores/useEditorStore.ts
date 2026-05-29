/**
 * @file useEditorStore.ts
 * @description 게시글 에디터(PostEditor) 상태를 관리하는 Zustand 스토어.
 */

import { JSONContent } from '@tiptap/react';
import { create } from 'zustand';

interface EditorState {
  title: string;
  content: JSONContent | null;
  tags: string[];
  isSubmitting: boolean;
  editorKey: number;

  setTitle: (title: string) => void;
  setContent: (content: JSONContent | null) => void;
  setTags: (tags: string[] | ((prev: string[]) => string[])) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  incrementEditorKey: () => void;
  setInitialData: (data: { title?: string; content?: JSONContent | null; tags?: string[] }) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  title: '',
  content: null,
  tags: [],
  isSubmitting: false,
  editorKey: 0,

  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setTags: (tags) =>
    set((state) => ({ tags: typeof tags === 'function' ? tags(state.tags) : tags })),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  incrementEditorKey: () => set((state) => ({ editorKey: state.editorKey + 1 })),
  setInitialData: (data) =>
    set((state) => ({
      title: data.title || '',
      content: data.content || null,
      tags: data.tags || [],
      editorKey: state.editorKey + 1,
    })),
  reset: () =>
    set({
      title: '',
      content: null,
      tags: [],
      isSubmitting: false,
      editorKey: 0,
    }),
}));

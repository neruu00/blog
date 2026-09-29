'use client';

/**
 * @file useDraft.tsx
 * @description 에디터 임시 저장 훅. localStorage에 1분마다 자동으로 저장하고, 진입할 때 저장본이 있으면 불러올지 묻는다.
 *              변경 사항이 있으면 페이지를 떠나기 전에 경고한다.
 */

import { JSONContent } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  EMPTY_SERIES_SELECTION,
  useEditorStore,
  type SeriesSelection,
} from '@/stores/useEditorStore';
import { useModalStore } from '@/stores/useModalStore';
import { useToastStore } from '@/stores/useToastStore';

export interface DraftInitialData {
  title: string;
  content: JSONContent | null;
  tags: string[];
  seriesId?: string | null;
}

/** 임시저장본의 시리즈 선택을 읽는다. 형식이 맞지 않으면 시리즈 없음으로 본다. */
function parseDraftSeries(value: unknown): SeriesSelection {
  if (typeof value !== 'object' || value === null) return EMPTY_SERIES_SELECTION;
  const { seriesId, newSeriesTitle, seriesAfter } = value as Record<string, unknown>;
  return {
    seriesId: typeof seriesId === 'string' ? seriesId : null,
    newSeriesTitle: typeof newSeriesTitle === 'string' ? newSeriesTitle : '',
    seriesAfter: typeof seriesAfter === 'string' ? seriesAfter : null,
  };
}

interface UseDraftProps {
  mode: 'create' | 'edit';
  postId?: string;
  initialData?: DraftInitialData;
}

export function useDraft({ mode, postId, initialData }: UseDraftProps) {
  const {
    title,
    content,
    tags,
    series,
    setTitle,
    setContent,
    setTags,
    setSeries,
    incrementEditorKey,
  } = useEditorStore();
  const { open, close } = useModalStore();
  const addToast = useToastStore((state) => state.addToast);

  const [isChanged, setIsChanged] = useState(false);

  const DRAFT_KEY = mode === 'create' ? 'blog-draft-new' : `blog-draft-edit-${postId}`;

  useEffect(() => {
    const changed =
      title !== (initialData?.title || '') ||
      JSON.stringify(content) !== JSON.stringify(initialData?.content || null) ||
      JSON.stringify(tags) !== JSON.stringify(initialData?.tags || []) ||
      series.seriesId !== (initialData?.seriesId ?? null) ||
      series.newSeriesTitle !== '' ||
      series.seriesAfter !== null;
    setIsChanged(changed);
  }, [title, content, tags, series, initialData]);

  const handleRestoreDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const {
          title: dTitle,
          content: dContent,
          tags: dTags,
          series: dSeries,
        } = JSON.parse(savedDraft);
        setTitle(dTitle || '');
        setContent(dContent || null);
        setTags(dTags || []);
        setSeries(parseDraftSeries(dSeries));
        incrementEditorKey();
        addToast('임시저장 데이터를 불러왔습니다.', 'success');
      } catch (e) {
        console.error('임시저장 데이터 파싱 에러:', e);
      }
    }
    close();
  }, [DRAFT_KEY, setTitle, setContent, setTags, setSeries, incrementEditorKey, addToast, close]);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      open(
        <ConfirmDialog
          title="임시저장 불러오기"
          message="작성 중이던 임시저장 데이터가 있습니다. 불러오시겠습니까?"
          onConfirm={handleRestoreDraft}
          onCancel={() => {
            localStorage.removeItem(DRAFT_KEY);
            close();
          }}
          confirmText="불러오기"
          cancelText="무시하기"
        />,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DRAFT_KEY]);

  const saveDraft = useCallback(() => {
    const hasSeries = series.seriesId !== null || series.newSeriesTitle !== '';
    if (mode === 'create' && !title && !content && tags.length === 0 && !hasSeries) return;
    const draftData = { title, content, tags, series };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  }, [DRAFT_KEY, title, content, tags, series, mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      saveDraft();
    }, 60000);
    return () => clearInterval(timer);
  }, [saveDraft]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isChanged) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isChanged]);

  const handleManualSave = () => {
    saveDraft();
    addToast('임시저장이 완료되었습니다.', 'success');
  };

  return { saveDraft, handleManualSave, isChanged, DRAFT_KEY };
}

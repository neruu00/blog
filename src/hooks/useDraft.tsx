'use client';

import { useCallback, useEffect, useState } from 'react';

import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useEditorStore } from '@/stores/useEditorStore';
import { useModalStore } from '@/stores/useModalStore';
import { useToastStore } from '@/stores/useToastStore';

interface UseDraftProps {
  mode: 'create' | 'edit';
  postId?: string;
  initialData?: any;
}

export function useDraft({ mode, postId, initialData }: UseDraftProps) {
  const { title, content, tags, setTitle, setContent, setTags, incrementEditorKey } =
    useEditorStore();
  const { open, close } = useModalStore();
  const addToast = useToastStore((state) => state.addToast);

  const [isChanged, setIsChanged] = useState(false);

  const DRAFT_KEY = mode === 'create' ? 'blog-draft-new' : `blog-draft-edit-${postId}`;

  useEffect(() => {
    const changed =
      title !== (initialData?.title || '') ||
      JSON.stringify(content) !== JSON.stringify(initialData?.content || null) ||
      JSON.stringify(tags) !== JSON.stringify(initialData?.tags || []);
    setIsChanged(changed);
  }, [title, content, tags, initialData]);

  const handleRestoreDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const { title: dTitle, content: dContent, tags: dTags } = JSON.parse(savedDraft);
        setTitle(dTitle || '');
        setContent(dContent || null);
        setTags(dTags || []);
        incrementEditorKey();
        addToast('임시저장 데이터를 불러왔습니다.', 'success');
      } catch (e) {
        console.error('임시저장 데이터 파싱 에러:', e);
      }
    }
    close();
  }, [DRAFT_KEY, setTitle, setContent, setTags, incrementEditorKey, addToast, close]);

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
    if (mode === 'create' && !title && !content && tags.length === 0) return;
    const draftData = { title, content, tags };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  }, [DRAFT_KEY, title, content, tags, mode]);

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

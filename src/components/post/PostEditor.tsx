'use client';

import { useEffect } from 'react';

import EditorActions from '@/components/editor/EditorActions';
import PostTitleInput from '@/components/editor/PostTitleInput';
import SeriesInputField from '@/components/editor/SeriesInputField';
import TagInputField from '@/components/editor/TagInputField';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { useDraft, type DraftInitialData } from '@/hooks/useDraft';
import { usePostSubmit } from '@/hooks/usePostSubmit';
import { useEditorStore } from '@/stores/useEditorStore';
import type { SeriesOption } from '@/types/series.type';

interface PostEditorProps {
  mode: 'create' | 'edit';
  initialData?: DraftInitialData;
  postId?: string;
  /** 시리즈 입력칸의 자동완성 목록 */
  seriesOptions: SeriesOption[];
  onSubmit: (
    formData: FormData,
  ) => Promise<{ success: boolean; data?: { postId?: string }; error?: string }>;
}

export default function PostEditor({
  mode,
  initialData,
  postId,
  seriesOptions,
  onSubmit,
}: PostEditorProps) {
  const {
    tags,
    setTags,
    seriesTitle,
    setSeriesTitle,
    seriesOrder,
    setSeriesOrder,
    content,
    setContent,
    isSubmitting,
    editorKey,
    setInitialData,
    reset,
  } = useEditorStore();

  useEffect(() => {
    setInitialData(initialData || {});
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { handleManualSave, isChanged, DRAFT_KEY } = useDraft({
    mode,
    postId,
    initialData,
  });

  const { handleSubmit, handleBack } = usePostSubmit({
    mode,
    postId,
    DRAFT_KEY,
    isChanged,
    onSubmit,
  });

  return (
    <main className="min-h-screen px-4 py-10 pb-24 font-sans">
      <form onSubmit={handleSubmit}>
        <PostTitleInput mode={mode} />

        <div className="mx-auto w-full max-w-4xl space-y-6">
          <TagInputField tags={tags} onChange={setTags} />
          <SeriesInputField
            options={seriesOptions}
            seriesTitle={seriesTitle}
            seriesOrder={seriesOrder}
            initialSeriesTitle={initialData?.seriesTitle}
            initialSeriesOrder={initialData?.seriesOrder}
            onSeriesTitleChange={setSeriesTitle}
            onSeriesOrderChange={setSeriesOrder}
          />
          <TiptapEditor key={editorKey} content={content} onChange={setContent} />
        </div>

        <EditorActions
          mode={mode}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onSaveDraft={handleManualSave}
        />
      </form>
    </main>
  );
}

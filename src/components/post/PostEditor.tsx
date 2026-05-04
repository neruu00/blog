'use client';

import { JSONContent } from '@tiptap/react';
import { useEffect } from 'react';

import EditorFooter from '@/components/editor/EditorFooter';
import PostTitleInput from '@/components/editor/PostTitleInput';
import TagInputField from '@/components/editor/TagInputField';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { useDraft } from '@/hooks/useDraft';
import { usePostSubmit } from '@/hooks/usePostSubmit';
import { useEditorStore } from '@/stores/useEditorStore';

interface PostEditorProps {
  mode: 'create' | 'edit';
  initialData?: {
    title: string;
    content: JSONContent | null;
    tags: string[];
  };
  postId?: string;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; postId?: string; error?: string }>;
}

export default function PostEditor({ mode, initialData, postId, onSubmit }: PostEditorProps) {
  const { tags, setTags, content, setContent, isSubmitting, editorKey, setInitialData, reset } =
    useEditorStore();

  useEffect(() => {
    setInitialData(initialData || {});
    return () => reset();
  }, [initialData, setInitialData, reset]);

  const { saveDraft, handleManualSave, isChanged, DRAFT_KEY } = useDraft({
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
          <TiptapEditor key={editorKey} content={content} onChange={setContent} />
        </div>

        <EditorFooter
          mode={mode}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onSaveDraft={handleManualSave}
        />
      </form>
    </main>
  );
}

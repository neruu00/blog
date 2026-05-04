'use client';

import { JSONContent } from '@tiptap/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { deletePost } from '@/actions/post';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EditorFooter from '@/components/editor/EditorFooter';
import TagInputField from '@/components/editor/TagInputField';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { useModalStore } from '@/stores/useModalStore';
import { useToastStore } from '@/stores/useToastStore';

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
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState<JSONContent | null>(initialData?.content || null);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const { open, close } = useModalStore();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

  const DRAFT_KEY = mode === 'create' ? 'blog-draft-new' : `blog-draft-edit-${postId}`;

  // 변경 감지용 데이터
  const isChanged =
    title !== (initialData?.title || '') ||
    JSON.stringify(content) !== JSON.stringify(initialData?.content || null) ||
    JSON.stringify(tags) !== JSON.stringify(initialData?.tags || []);

  // 임시저장 데이터 적용 함수
  const handleRestoreDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const { title: dTitle, content: dContent, tags: dTags } = JSON.parse(savedDraft);
        setTitle(dTitle || '');
        setContent(dContent || null);
        setTags(dTags || []);
        setEditorKey((prev) => prev + 1);
        addToast('임시저장 데이터를 불러왔습니다.', 'success');
      } catch (e) {
        console.error('임시저장 데이터 파싱 에러:', e);
      }
    }
    close();
  }, [DRAFT_KEY, addToast, close]);

  // 임시저장 불러오기 체크
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
  }, [DRAFT_KEY]); // mount 시 한 번만 실행

  // 임시저장 실행 함수
  const saveDraft = useCallback(() => {
    if (mode === 'create' && !title && !content && tags.length === 0) return;
    const draftData = { title, content, tags };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  }, [DRAFT_KEY, title, content, tags, mode]);

  // 주기적 자동 저장 (60초)
  useEffect(() => {
    const timer = setInterval(() => {
      saveDraft();
    }, 60000);
    return () => clearInterval(timer);
  }, [saveDraft]);

  // 브라우저 탭 닫기 방지
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

  const handleBack = () => {
    if (isChanged) {
      open(
        <ConfirmDialog
          title="변경사항 저장 안 됨"
          message="작성 중인 내용은 저장되지 않습니다. 정말 나가시겠습니까?"
          onConfirm={() => {
            close();
            router.back();
          }}
          onCancel={close}
          confirmText="나가기"
          cancelText="계속 작성"
          isDanger={true}
        />,
      );
    } else {
      router.back();
    }
  };

  const handleDelete = async () => {
    if (!postId) return;
    setIsSubmitting(true);
    close();

    try {
      const result = await deletePost(postId);
      if (result.success) {
        addToast('게시글이 삭제되었습니다.', 'success');
        router.push('/posts');
        router.refresh();
      } else {
        addToast(result.error || '삭제에 실패했습니다.', 'error');
        setIsSubmitting(false);
      }
    } catch (error: unknown) {
      console.error('게시글 삭제 에러:', error);
      const errorMessage = error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.';
      addToast(errorMessage, 'error');
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = () => {
    open(
      <ConfirmDialog
        title="게시글 삭제"
        message="정말 이 게시글을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
        onConfirm={handleDelete}
        onCancel={close}
        confirmText="삭제하기"
        cancelText="취소"
        isDanger={true}
      />,
    );
  };

  const handleManualSave = () => {
    saveDraft();
    addToast('임시저장이 완료되었습니다.', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 실질적인 콘텐츠가 있는지 재귀적으로 확인하는 헬퍼 함수
    const hasMeaningfulContent = (node: JSONContent): boolean => {
      if (node.text && node.text.trim().length > 0) return true;
      if (node.type && ['image', 'codeBlock', 'mermaidBlock', 'horizontalRule'].includes(node.type))
        return true;
      if (node.content && node.content.length > 0) {
        return node.content.some(hasMeaningfulContent);
      }
      return false;
    };

    const isEmpty = !content || !hasMeaningfulContent(content);
    if (!title.trim() || isEmpty) {
      addToast('제목과 내용을 모두 작성해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (postId) formData.append('postId', postId);
      formData.append('title', title);
      formData.append('content', JSON.stringify(content));
      formData.append('tags', JSON.stringify(tags));

      const result = await onSubmit(formData);

      if (result.success) {
        const targetId = result.postId ?? postId;

        if (!targetId) {
          addToast('게시글 ID를 확인할 수 없습니다.', 'error');
          setIsSubmitting(false);
          return;
        }

        localStorage.removeItem(DRAFT_KEY);
        addToast(
          mode === 'create' ? '게시글이 발행되었습니다!' : '게시글이 수정되었습니다!',
          'success',
        );
        router.push(`/posts/${targetId}`);
        router.refresh();
      } else {
        addToast(result.error || '저장에 실패했습니다.', 'error');
        setIsSubmitting(false);
      }
    } catch (error: unknown) {
      console.error('게시글 저장 에러:', error);
      const errorMessage = error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.';
      addToast(errorMessage, 'error');
      setIsSubmitting(false);
    }
  };

  return (
    // pb-20: Fixed Footer(h-16) + 여유 마진으로 에디터 콘텐츠가 가려지지 않도록 한다
    <main className="min-h-screen px-4 py-10 pb-24 font-sans">
      <form onSubmit={handleSubmit}>
        <div className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between">
          <div className="flex-1 space-y-[8px]">
            <label className="text-[12px] font-bold tracking-widest text-orange-500 uppercase">
              {mode === 'create' ? 'NEW POST' : 'EDIT POST'}
            </label>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              className="block w-full border-none bg-transparent text-4xl font-bold text-gray-900 placeholder-gray-300 outline-none dark:text-white dark:placeholder:text-neutral-700"
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl space-y-6">
          <TagInputField tags={tags} onChange={setTags} />
          <TiptapEditor key={editorKey} content={content} onChange={setContent} />
        </div>

        {/* Fixed 하단 푸터 — 뒤로가기, 임시저장, 제출 */}
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

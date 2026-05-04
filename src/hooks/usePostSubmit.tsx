'use client';

import { JSONContent } from '@tiptap/react';
import { useRouter } from 'next/navigation';

import { deletePost } from '@/actions/post';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useEditorStore } from '@/stores/useEditorStore';
import { useModalStore } from '@/stores/useModalStore';
import { useToastStore } from '@/stores/useToastStore';

interface UsePostSubmitProps {
  mode: 'create' | 'edit';
  postId?: string;
  DRAFT_KEY: string;
  isChanged: boolean;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; postId?: string; error?: string }>;
}

export function usePostSubmit({
  mode,
  postId,
  DRAFT_KEY,
  isChanged,
  onSubmit,
}: UsePostSubmitProps) {
  const { title, content, tags, isSubmitting, setIsSubmitting } = useEditorStore();
  const { open, close } = useModalStore();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

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

  return { handleSubmit, handleBack, openDeleteModal };
}

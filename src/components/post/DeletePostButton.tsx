'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deletePost } from '@/actions/post';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/ui/Button';
import { useModalStore } from '@/stores/useModalStore';
import { useToastStore } from '@/stores/useToastStore';

interface DeletePostButtonProps {
  postId: string;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { open, close } = useModalStore();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

  const handleDelete = async () => {
    setIsDeleting(true);
    close();

    const result = await deletePost(postId);

    if (result.success) {
      addToast('게시글이 삭제되었습니다.', 'success');
      router.push('/posts');
      router.refresh();
    } else {
      addToast(result.error || '게시글 삭제에 실패했습니다.', 'error');
      setIsDeleting(false);
    }
  };

  const openModal = () => {
    open(
      <ConfirmDialog
        title="게시글 삭제"
        message="정말로 이 게시글을 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onCancel={close}
        confirmText="삭제하기"
        cancelText="취소"
        isDanger={true}
      />,
    );
  };

  return (
    <Button
      variant="destructive"
      size="md"
      onClick={openModal}
      disabled={isDeleting}
      title="게시글 삭제"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}

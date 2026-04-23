'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deletePost } from '@/actions/post';
import { useToastStore } from '@/stores/useToastStore';

interface DeletePostButtonProps {
  postId: string;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);

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

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
      title="게시글 삭제"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}

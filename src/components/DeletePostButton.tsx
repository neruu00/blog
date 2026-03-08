'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deletePost } from '@/actions/post';

interface DeletePostButtonProps {
  postId: string;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);

    // 서버 액션 호출
    const result = await deletePost(postId);

    if (result.success) {
      // 삭제 성공 시 목록 페이지로 이동
      router.push('/posts');
      router.refresh();
    } else {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
      title="게시글 삭제"
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? '삭제 중...' : '삭제'}
    </button>
  );
}

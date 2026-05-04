'use client';

import { useSession } from 'next-auth/react';
import { useState, useTransition } from 'react';

import { createComment } from '@/actions/comment';
import { trackCommentCreate } from '@/lib/utils/analytics';
import { useToastStore } from '@/stores/useToastStore';

interface CommentFormProps {
  postId: string;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const { data: session } = useSession();
  const addToast = useToastStore((state) => state.addToast);

  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      addToast('로그인이 필요합니다.', 'error');
      return;
    }
    if (!content.trim()) {
      addToast('댓글 내용을 입력해주세요.', 'error');
      return;
    }

    startTransition(async () => {
      const result = await createComment({ postId, content, parentId: null });
      if (result.success && result.data) {
        setContent('');
        addToast('댓글이 작성되었습니다.', 'success');
        trackCommentCreate(postId);
      } else {
        addToast(result.error || '댓글 작성 실패', 'error');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-10">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending || !session}
          placeholder={
            session ? '자유롭게 의견을 남겨주세요.' : '로그인 후 댓글을 작성할 수 있습니다.'
          }
          className="min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none disabled:opacity-60"
        />
        <div className="absolute right-3 bottom-3">
          <button
            type="submit"
            disabled={isPending || !session || !content.trim()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300"
          >
            {isPending ? '작성 중...' : '댓글 작성'}
          </button>
        </div>
      </div>
    </form>
  );
}

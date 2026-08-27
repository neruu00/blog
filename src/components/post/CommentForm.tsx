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

  const submit = () => {
    if (!session) {
      addToast('로그인이 필요합니다.', 'error');
      return;
    }
    if (!content.trim()) {
      addToast('댓글 내용을 입력해주세요.', 'error');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createComment({ postId, content, parentId: null });
        if (result.success && result.data) {
          setContent('');
          addToast('댓글이 작성되었습니다.', 'success');
          trackCommentCreate(postId);
        } else if (!result.success) {
          addToast(result.error || '댓글 작성 실패', 'error');
        }
      } catch (error) {
        console.error('댓글 작성 중 오류 발생:', error);
        addToast('댓글 작성 중 오류가 발생했습니다.', 'error');
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 조합 중의 Enter는 확정용이라 제출로 삼으면 안 된다
    if (e.nativeEvent.isComposing) return;
    if (e.key !== 'Enter' || e.shiftKey) return;

    e.preventDefault();
    submit();
  };

  return (
    <div className="mb-10">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isPending || !session}
        placeholder={
          session ? '자유롭게 의견을 남겨주세요.' : '로그인 후 댓글을 작성할 수 있습니다.'
        }
        className="min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none disabled:opacity-60"
      />
      {session && (
        <p className="mt-2 text-xs text-gray-400">
          {isPending ? '작성 중...' : 'Enter로 등록 · Shift+Enter로 줄바꿈'}
        </p>
      )}
    </div>
  );
}

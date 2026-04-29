'use client';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useTransition } from 'react';

import { createComment, deleteComment } from '@/actions/comment';
import { trackCommentCreate, trackCommentDelete } from '@/lib/utils/analytics';
import { formatDateKo } from '@/lib/utils/date';
import { useToastStore } from '@/stores/useToastStore';

interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  user?: CommentUser;
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession();
  const addToast = useToastStore((state) => state.addToast);

  const [comments, setComments] = useState<Comment[]>(initialComments);
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
        setComments((prev) => [...prev, result.data as unknown as Comment]);
        setContent('');
        addToast('댓글이 작성되었습니다.', 'success');
        trackCommentCreate(postId);
      } else {
        addToast(result.error || '댓글 작성 실패', 'error');
      }
    });
  };

  const handleDelete = (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    startTransition(async () => {
      const result = await deleteComment(commentId, postId);
      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        addToast('댓글이 삭제되었습니다.', 'success');
        trackCommentDelete(postId);
      } else {
        addToast(result.error || '삭제 실패', 'error');
      }
    });
  };

  // @ts-ignore
  const isAdmin = session?.user?.isAdmin;

  return (
    <div className="mt-16 border-t border-gray-100 pt-8">
      <h3 className="mb-6 text-lg font-bold text-gray-900">
        댓글 <span className="text-orange-500">{comments.length}</span>
      </h3>

      {/* 댓글 작성 폼 */}
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

      {/* 댓글 목록 */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isAuthor = session?.user?.id === comment.user_id;
            const canDelete = isAuthor || isAdmin;

            return (
              <div key={comment.id} className="flex gap-4">
                {/* 프로필 이미지 */}
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                  {comment.user?.image ? (
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name || 'User'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
                      {(comment.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* 댓글 내용 */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.user?.name || '알 수 없음'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDateKo(new Date(comment.created_at))}
                      </span>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={isPending}
                        className="p-1 text-gray-400 transition-colors hover:text-red-500"
                        aria-label="댓글 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-gray-100 py-10 text-center text-sm text-gray-400">
            첫 번째 댓글을 남겨보세요!
          </div>
        )}
      </div>
    </div>
  );
}

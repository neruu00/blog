'use client';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useTransition } from 'react';

import { deleteComment } from '@/actions/comment';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import IconButton from '@/components/ui/IconButton';
import { trackCommentDelete } from '@/lib/utils/analytics';
import { formatDateKo } from '@/lib/utils/date';
import { useModalStore } from '@/stores/useModalStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Comment } from '@/types/comment.type';

interface CommentListProps {
  postId: string;
  comments: Comment[];
}

export default function CommentList({ postId, comments }: CommentListProps) {
  const { data: session } = useSession();
  const addToast = useToastStore((state) => state.addToast);
  const { open, close } = useModalStore();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (commentId: string) => {
    open(
      <ConfirmDialog
        title="댓글 삭제"
        message="댓글을 삭제하시겠습니까?"
        onConfirm={() => {
          close();
          startTransition(async () => {
            const result = await deleteComment(commentId, postId);
            if (result.success) {
              addToast('댓글이 삭제되었습니다.', 'success');
              trackCommentDelete(postId);
            } else {
              addToast(result.error || '삭제 실패', 'error');
            }
          });
        }}
        onCancel={close}
        confirmText="삭제하기"
        cancelText="취소"
        isDanger={true}
      />,
    );
  };

  const isAdmin = session?.user?.isAdmin;

  if (comments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-100 py-10 text-center text-sm text-gray-400">
        첫 번째 댓글을 남겨보세요!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => {
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
                  <IconButton
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => handleDelete(comment.id)}
                    disabled={isPending}
                    label="댓글 삭제"
                    variant="danger"
                  />
                )}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                {comment.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

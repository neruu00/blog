import type { Comment } from '@/types/comment.type';

import CommentForm from './CommentForm';
import CommentList from './CommentList';

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  return (
    <div className="mt-16 border-t border-gray-100 pt-8">
      <h3 className="mb-6 text-lg font-bold text-gray-900">
        댓글 <span className="text-orange-500">{initialComments.length}</span>
      </h3>

      <CommentForm postId={postId} />
      <CommentList postId={postId} comments={initialComments} />
    </div>
  );
}

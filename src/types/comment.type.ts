/**
 * @file comment.type.ts
 * @description 댓글 타입.
 */

export interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  user?: CommentUser;
}

/**
 * @file comment.type.ts
 * @description 댓글 관련 타입 정의.
 */

export interface Comment {
  /** 댓글 고유 ID */
  id: string;
  /** 게시글 ID */
  postId: string;
  /** 작성자 ID (Auth.js user ID) */
  userId: string;
  /** 작성자 이름 */
  userName: string;
  /** 작성자 프로필 이미지 URL */
  userImage: string;
  /** 부모 댓글 ID (null이면 최상위 댓글) */
  parentId: string | null;
  /** 댓글 내용 */
  content: string;
  /** 작성일 */
  createdAt: Date;
}

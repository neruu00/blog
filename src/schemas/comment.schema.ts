/**
 * @file comment.schema.ts
 * @description 댓글 작성 입력 검증 스키마.
 */

import { z } from 'zod/v4';

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, '댓글 내용을 입력해주세요.')
    .max(1000, '댓글은 1000자 이내로 입력해주세요.'),
  postId: z.string().uuid('유효하지 않은 게시글 ID입니다.'),
  parentId: z.string().uuid('유효하지 않은 부모 댓글 ID입니다.').nullable().default(null),
});

export type CommentInput = z.infer<typeof commentSchema>;

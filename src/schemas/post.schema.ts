/**
 * @file post.schema.ts
 * @description 게시글 관련 Zod 유효성 검사 스키마.
 *              클라이언트 1차 검증 + 서버 액션 2차 검증에 동일하게 사용.
 */

import { z } from 'zod/v4';

/** 게시글 생성/수정 입력 스키마 */
export const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이내로 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  tags: z.array(z.string()).max(5, '태그는 최대 5개까지 추가할 수 있습니다.').default([]),
  category: z.enum(['tech', 'project', 'portfolio', 'etc']).default('tech'),
});

/** 게시글 입력 타입 (Zod 추론) */
export type PostInput = z.infer<typeof postSchema>;

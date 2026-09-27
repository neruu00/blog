/**
 * @file post.schema.ts
 * @description 게시글 생성·수정 입력 검증 스키마. 클라이언트와 서버 액션이 같은 스키마로 검증한다.
 */

import { z } from 'zod/v4';

export const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이내로 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  tags: z.array(z.string()).max(5, '태그는 최대 5개까지 추가할 수 있습니다.').default([]),
  category: z.enum(['tech', 'project', 'etc']).default('tech'),
});

export type PostInput = z.infer<typeof postSchema>;

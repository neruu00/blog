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
  /** 빈 문자열이면 시리즈에 넣지 않는다. 없는 이름이면 저장할 때 새 시리즈를 만든다. */
  seriesTitle: z.string().trim().max(100, '시리즈 이름은 100자 이내로 입력해주세요.').default(''),
  /** 비우면 서버가 순서를 정한다. */
  seriesOrder: z.coerce
    .number()
    .int('시리즈 순서는 정수로 입력해주세요.')
    .min(1, '시리즈 순서는 1 이상이어야 합니다.')
    .optional(),
});

export type PostInput = z.infer<typeof postSchema>;

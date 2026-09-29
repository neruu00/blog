/**
 * @file post.schema.ts
 * @description 게시글 생성·수정 입력 검증 스키마. 클라이언트와 서버 액션이 같은 스키마로 검증한다.
 */

import { z } from 'zod/v4';

import { seriesTitleSchema } from '@/schemas/series.schema';

export const postSchema = z
  .object({
    title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이내로 입력해주세요.'),
    content: z.string().min(1, '내용을 입력해주세요.'),
    tags: z.array(z.string()).max(5, '태그는 최대 5개까지 추가할 수 있습니다.').default([]),
    category: z.enum(['tech', 'project', 'etc']).default('tech'),
    /** 넣을 기존 시리즈. `newSeriesTitle`과 함께 비우면 시리즈에 넣지 않는다 */
    seriesId: z.union([z.uuid(), z.literal('')]).default(''),
    /** 저장할 때 만들 새 시리즈 이름. 같은 이름의 시리즈가 있으면 그 시리즈에 넣는다 */
    newSeriesTitle: seriesTitleSchema.default(''),
    /** 시리즈 안 위치. `first`면 맨 앞, 글 id면 그 글 뒤. 비우면 서버가 정한다 */
    seriesAfter: z.union([z.literal('first'), z.uuid()]).optional(),
  })
  .refine((data) => !(data.seriesId && data.newSeriesTitle), {
    message: '시리즈를 하나만 선택해주세요.',
  });

export type PostInput = z.infer<typeof postSchema>;

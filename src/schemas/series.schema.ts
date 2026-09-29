/**
 * @file series.schema.ts
 * @description 게시글 시리즈 입력 검증 스키마.
 */

import { z } from 'zod/v4';

/** 시리즈 이름. 게시글 저장과 이름 변경이 같은 규칙을 쓴다. */
export const seriesTitleSchema = z
  .string()
  .trim()
  .max(100, '시리즈 이름은 100자 이내로 입력해주세요.');

export const seriesIdSchema = z.uuid('시리즈 ID가 올바르지 않습니다.');

export const renameSeriesSchema = z.object({
  seriesId: seriesIdSchema,
  title: seriesTitleSchema.min(1, '시리즈 이름을 입력해주세요.'),
});

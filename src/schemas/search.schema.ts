/**
 * @file search.schema.ts
 * @description 게시글 검색어(`/posts?q=`) 검증.
 */

import { z } from 'zod';

/**
 * 앞뒤 공백을 지우고 50자로 자른다. PostgREST 필터 문자열의 따옴표 값 안에 넣으므로
 * 따옴표를 닫거나 이스케이프할 수 있는 `"`와 `\`는 지운다. 잘못된 값은 빈 문자열(검색 안 함)로 처리한다.
 */
export const postSearchQuerySchema = z
  .string()
  .transform((value) => value.replace(/["\\]/g, '').trim().slice(0, 50))
  .catch('');

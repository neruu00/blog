/**
 * @file postSearch.ts
 * @description 게시글 검색어를 Supabase `or` 필터 문자열로 바꾼다. 제목과 태그를 함께 검색한다.
 */

import { TAG_DICTIONARY } from '@/lib/constants/tags';

/**
 * 검색어가 태그 이름이나 `keywords`의 일부와 맞는 태그를 모두 찾는다.
 * 예: "리액트" → React, "next" → Next.js, "jwt" → Security
 */
export function findMatchingTags(query: string): string[] {
  const lowered = query.toLowerCase();
  return TAG_DICTIONARY.filter(
    ({ name, keywords }) =>
      name.toLowerCase().includes(lowered) || keywords.some((keyword) => keyword.includes(lowered)),
  ).map(({ name }) => name);
}

/**
 * 제목 부분 일치(대소문자 무시) 또는 맞는 태그가 하나라도 있는 글을 찾는 `or` 필터를 만든다.
 * 값은 따옴표로 감싸 쉼표·괄호·점이 PostgREST 문법으로 해석되지 않게 한다.
 * `query`에는 `postSearchQuerySchema`로 `"`와 `\`를 지운 값만 넘겨야 한다.
 */
export function buildPostSearchFilter(query: string): string {
  const conditions = [`title.ilike."%${query}%"`];
  for (const tag of findMatchingTags(query)) {
    // 원소가 하나뿐인 배열로 만들어 `{}` 안의 쉼표가 or 구분자와 섞이지 않게 한다
    conditions.push(`tags.cs.{"${tag}"}`);
  }
  return conditions.join(',');
}

'use server';

/**
 * @file search.ts
 * @description 게시글 검색 서버 액션. 검색 창에서 입력하는 동안 미리 보기 결과를 가져온다.
 *              인증 없이 누구나 호출할 수 있으므로 공개된 목록 정보만 돌려주고 개수를 제한한다.
 */

import { supabase } from '@/lib/supabase';
import { mapPostSearchRow } from '@/lib/utils/mappers';
import { buildPostSearchFilter } from '@/lib/utils/postSearch';
import { postSearchQuerySchema } from '@/schemas/search.schema';
import type { ActionResult } from '@/types/action.type';
import type { PostSearchResult } from '@/types/search.type';

/** 미리 보기에 보여줄 최대 개수. 나머지는 `/posts?q=` 전체 결과에서 본다 */
const PREVIEW_LIMIT = 8;

/** 제목·태그로 게시글을 찾아 최신순으로 최대 8개 돌려준다. 빈 검색어는 빈 배열을 돌려준다 */
export async function searchPosts(rawQuery: unknown): Promise<ActionResult<PostSearchResult[]>> {
  const query = postSearchQuerySchema.parse(rawQuery);
  if (!query) return { success: true, data: [] };

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, tags, created_at, series(title)')
    .or(buildPostSearchFilter(query))
    .order('created_at', { ascending: false })
    .limit(PREVIEW_LIMIT);

  if (error) {
    console.error('게시글 검색 중 에러 발생:', error);
    return { success: false, error: '검색하지 못했습니다. 잠시 후 다시 시도해 주세요.' };
  }

  return { success: true, data: data.map(mapPostSearchRow) };
}

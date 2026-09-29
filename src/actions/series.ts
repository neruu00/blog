'use server';

/**
 * @file series.ts
 * @description 게시글 시리즈 이름 변경·삭제 서버 액션. 게시글 저장과 별개로 바로 반영된다.
 *              시리즈 생성과 속한 글이 없어진 시리즈 정리는 게시글 저장(actions/post.ts)이 처리한다.
 */

import { revalidatePath } from 'next/cache';

import { isAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { renameSeriesSchema, seriesIdSchema } from '@/schemas/series.schema';
import type { ActionResult } from '@/types/action.type';

/** Postgres unique_violation. 바꾸려는 이름을 다른 시리즈가 이미 쓰고 있다 */
const UNIQUE_VIOLATION = '23505';

/**
 * 시리즈 이름을 바꾸고 속한 글의 상세 페이지를 갱신한다.
 * 다른 시리즈와 이름이 겹치면 합치지 않고 실패를 반환한다.
 */
export async function renameSeries(seriesId: string, title: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { success: false, error: '관리자 권한이 필요합니다.' };

  const validatedFields = renameSeriesSchema.safeParse({ seriesId, title });
  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  try {
    const { data: renamed, error } = await supabase
      .from('series')
      .update({ title: validatedFields.data.title })
      .eq('id', validatedFields.data.seriesId)
      .select('id')
      .maybeSingle();

    if (error?.code === UNIQUE_VIOLATION) {
      return { success: false, error: '같은 이름의 시리즈가 이미 있습니다.' };
    }
    if (error) throw error;
    if (!renamed) return { success: false, error: '시리즈를 찾을 수 없습니다.' };

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .eq('series_id', validatedFields.data.seriesId);

    if (postsError) {
      console.warn('시리즈 글 목록 조회 실패:', postsError);
    } else {
      posts.forEach((post) => revalidatePath(`/posts/${post.id}`));
    }

    return { success: true };
  } catch (err) {
    console.error('시리즈 이름 변경 에러:', err);
    return { success: false, error: '시리즈 이름 변경에 실패했습니다.' };
  }
}

/**
 * 시리즈를 삭제한다. 속한 글은 지우지 않고 시리즈에서만 뺀다(series_id·series_order를 비운다).
 * FK의 ON DELETE SET NULL은 series_order를 남기므로 글을 먼저 비운 뒤 시리즈를 지운다.
 */
export async function deleteSeries(seriesId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { success: false, error: '관리자 권한이 필요합니다.' };

  const validatedId = seriesIdSchema.safeParse(seriesId);
  if (!validatedId.success) {
    return { success: false, error: validatedId.error.issues[0].message };
  }

  try {
    const { data: posts, error: releaseError } = await supabase
      .from('posts')
      .update({ series_id: null, series_order: null })
      .eq('series_id', validatedId.data)
      .select('id');

    if (releaseError) throw releaseError;

    const { error: deleteError } = await supabase
      .from('series')
      .delete()
      .eq('id', validatedId.data);

    if (deleteError) throw deleteError;

    posts.forEach((post) => revalidatePath(`/posts/${post.id}`));
    return { success: true };
  } catch (err) {
    console.error('시리즈 삭제 에러:', err);
    return { success: false, error: '시리즈 삭제에 실패했습니다.' };
  }
}

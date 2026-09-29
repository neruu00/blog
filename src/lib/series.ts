/**
 * @file series.ts
 * @description 게시글 시리즈 조회. 시리즈 안 순서는 series_order → created_at 순이다.
 */

import { supabase } from '@/lib/supabase';
import type { PostSeries, SeriesOption } from '@/types/series.type';

/** 에디터에서 고를 수 있는 시리즈 목록을 이름순으로 반환한다. 조회에 실패하면 빈 배열을 반환한다. */
export async function getSeriesOptions(): Promise<SeriesOption[]> {
  const { data, error } = await supabase
    .from('series')
    .select('id, title, posts(series_order)')
    .order('title', { ascending: true });

  if (error) {
    console.error('시리즈 목록 조회 에러:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    maxOrder: Math.max(
      0,
      ...row.posts.map((post: { series_order: number | null }) => post.series_order ?? 0),
    ),
  }));
}

/** 시리즈 이름과 속한 글 목록을 순서대로 반환한다. 시리즈가 없거나 조회에 실패하면 null을 반환한다. */
export async function getPostSeries(seriesId: string): Promise<PostSeries | null> {
  const [{ data: series, error: seriesError }, { data: posts, error: postsError }] =
    await Promise.all([
      supabase.from('series').select('title').eq('id', seriesId).maybeSingle(),
      supabase
        .from('posts')
        .select('id, title')
        .eq('series_id', seriesId)
        .order('series_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true }),
    ]);

  if (seriesError || postsError) {
    console.error('시리즈 조회 에러:', seriesError ?? postsError);
    return null;
  }
  if (!series || !posts) return null;

  return { title: series.title, posts };
}

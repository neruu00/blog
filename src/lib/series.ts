/**
 * @file series.ts
 * @description 게시글 시리즈 조회. 시리즈 안 순서는 series_order → created_at 순이다.
 */

import { supabase } from '@/lib/supabase';
import type { PostSeries, SeriesOption, SeriesPost } from '@/types/series.type';

interface SeriesPostRow {
  id: string;
  title: string;
  series_order: number | null;
  created_at: string;
}

/** 시리즈 안 순서로 정렬한다. 순서가 없는 글은 뒤로 보내고, 순서가 같으면 먼저 쓴 글이 앞선다. */
function sortSeriesPosts(rows: SeriesPostRow[]): SeriesPost[] {
  return [...rows]
    .sort(
      (a, b) =>
        (a.series_order ?? Infinity) - (b.series_order ?? Infinity) ||
        a.created_at.localeCompare(b.created_at),
    )
    .map(({ id, title }) => ({ id, title }));
}

/** 에디터에서 고를 수 있는 시리즈 목록을 이름순으로 반환한다. 조회에 실패하면 빈 배열을 반환한다. */
export async function getSeriesOptions(): Promise<SeriesOption[]> {
  const { data, error } = await supabase
    .from('series')
    .select('id, title, posts(id, title, series_order, created_at)')
    .order('title', { ascending: true });

  if (error) {
    console.error('시리즈 목록 조회 에러:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    posts: sortSeriesPosts(row.posts),
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

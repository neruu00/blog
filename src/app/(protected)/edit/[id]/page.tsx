/**
 * @file page.tsx
 * @description 게시글 수정 페이지. 기존 글과 시리즈 목록을 조회해 에디터에 넘긴다.
 */

import { notFound } from 'next/navigation';

import { getSeriesOptions } from '@/lib/series';
import { supabase } from '@/lib/supabase';

import EditPostClient from './_components/EditPostClient';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: post, error }, seriesOptions] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, content, tags, series_id, series_order')
      .eq('id', id)
      .single(),
    getSeriesOptions(),
  ]);

  if (error || !post) notFound();

  const seriesTitle = seriesOptions.find((option) => option.id === post.series_id)?.title ?? '';

  return (
    <EditPostClient
      post={{
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags,
        seriesTitle,
        seriesOrder: seriesTitle ? post.series_order : null,
      }}
      seriesOptions={seriesOptions}
    />
  );
}

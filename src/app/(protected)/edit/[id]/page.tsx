/**
 * @file page.tsx
 * @description 게시글 수정 페이지. 기존 글을 조회해 에디터에 넘긴다.
 */

import { notFound } from 'next/navigation';

import { supabase } from '@/lib/supabase';

import EditPostClient from './_components/EditPostClient';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: post, error } = await supabase
    .from('posts')
    .select('id, title, content, tags')
    .eq('id', id)
    .single();

  if (error || !post) notFound();

  return <EditPostClient post={post} />;
}

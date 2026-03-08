import { notFound } from 'next/navigation';

import EditPostClient from './_components/EditPostClient';
import { supabase } from '@/lib/supabase';

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

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import EditPostClient from './_components/EditPostClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 관리자 권한 확인 (보안)
  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get('admin_session');

  if (!isAdmin) {
    redirect('/login');
  }

  const { data: post, error } = await supabase
    .from('posts')
    .select('id, title, content, tags')
    .eq('id', id)
    .single();

  if (error || !post) notFound();

  return <EditPostClient post={post} />;
}

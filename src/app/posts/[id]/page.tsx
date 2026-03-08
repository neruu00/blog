import { ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import DeletePostButton from '@/components/DeletePostButton';
import TiptapViewer from '@/components/editor/TiptapViewer';
import { supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. 비동기로 params 해제하여 id 추출
  const { id } = await params;

  // 관리자 여부 판단 (게시글 조회는 누구나 가능하지만, 삭제 버튼 등은 관리자에게만 보여주기 위함)
  const isAdmin = await verifyAdminSession();

  // 2. Supabase에서 해당 id의 게시글 단건 조회
  const { data: post, error } = await supabase.from('posts').select('*').eq('id', id).single();

  if (error || !post) notFound();

  // 4. 날짜 포맷팅 (Supabase의 created_at 사용)
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(post.created_at));

  const author = post.author || 'admin';

  const tags = post.tags || [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-[#0a0a0a]">
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12 flex items-center justify-between">
          <Link
            href="/posts"
            className="inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-orange-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Link>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                href={`/edit/${post.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
              >
                수정하기
              </Link>
              <DeletePostButton postId={post.id} />
            </div>
          )}
        </div>

        <header className="mb-10">
          <div className="mb-6 flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-md bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mb-8 text-3xl leading-tight font-extrabold tracking-tight text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 pb-8 text-sm text-gray-600 dark:border-neutral-800 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span className="font-medium text-gray-900 dark:text-neutral-200">{author}</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-neutral-700" />
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={new Date(post.created_at).toISOString()}>{formattedDate}</time>
            </div>
          </div>
        </header>

        <article className="mt-10 min-h-[50vh]">
          <TiptapViewer content={post.content} />
        </article>
      </div>
    </main>
  );
}

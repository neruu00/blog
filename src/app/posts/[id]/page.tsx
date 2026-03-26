import { ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import DeletePostButton from '@/components/DeletePostButton';
import TiptapViewer from '@/components/editor/TiptapViewer';
import { verifyAdminSession } from '@/lib/auth';
import extractTextFromTiptap from '@/lib/extractTextFromTiptap';
import { supabase } from '@/lib/supabase';

import type { Metadata, ResolvingMetadata } from 'next';

const getPost = cache(async (id: string) => {
  return supabase.from('posts').select('*').eq('id', id).single();
});

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  const { data: post } = await getPost(id);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const plainText = extractTextFromTiptap(post.content);
  const description = plainText.length > 160 ? plainText.slice(0, 160) + '...' : plainText;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.created_at,
      authors: [post.author || 'neruu00'],
      tags: post.tags || [],
    },
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const isAdmin = await verifyAdminSession();

  const { data: post, error } = await getPost(id);

  if (error || !post) notFound();

  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(post.created_at));

  const author = post.author || 'admin';

  const tags = post.tags || [];

  return (
    <main className="relative min-h-screen font-sans">
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/posts"
            className="font-marker hover:text-brand inline-flex items-center text-xl text-slate-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Link>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                href={`/edit/${post.id}`}
                className="text-brand hover:bg-brand/10 dark:text-brand inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold uppercase transition-colors"
              >
                EDIT
              </Link>
              <DeletePostButton postId={post.id} />
            </div>
          )}
        </div>

        <div className="relative mb-20 transform rounded-sm border border-slate-200 bg-white p-10 shadow-xl md:p-14 dark:border-slate-800 dark:bg-slate-900">
          {/* Document Pin */}
          <div className="absolute -top-3 left-1/2 z-10 -ml-3 h-6 w-6 rounded-full border-2 border-white/50 bg-red-500 shadow-md"></div>

          <header className="mb-10">
            <div className="mb-6 flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-brand rounded-md bg-slate-100 px-3 py-1 font-sans text-xs font-bold tracking-widest uppercase dark:bg-slate-800"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mb-8 text-4xl leading-tight font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 border-b-2 border-slate-100 pb-8 text-sm font-bold tracking-wide text-slate-500 uppercase dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <User className="text-brand h-4 w-4" />
                <span className="text-slate-800 dark:text-slate-200">{author}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <Calendar className="text-brand h-4 w-4" />
                <time dateTime={new Date(post.created_at).toISOString()}>{formattedDate}</time>
              </div>
            </div>
          </header>

          <article className="prose prose-slate dark:prose-invert mt-10 min-h-[50vh] max-w-none">
            <TiptapViewer content={post.content} />
          </article>
        </div>
      </div>
    </main>
  );
}

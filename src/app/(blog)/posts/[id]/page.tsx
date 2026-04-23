/**
 * @file page.tsx
 * @description 게시글 상세 페이지.
 *              게시글 제목, 메타 정보, 본문(Tiptap)을 표시한다.
 *              admin인 경우 수정/삭제 버튼을 표시한다.
 */

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getComments } from '@/actions/comment';
import { getLikeStatus } from '@/actions/like';
import DeletePostButton from '@/components/DeletePostButton';
import TiptapViewer from '@/components/editor/TiptapViewer';
import CommentSection from '@/components/post/CommentSection';
import LikeButton from '@/components/post/LikeButton';
import TableOfContents from '@/components/post/TableOfContents';
import ViewCounter from '@/components/post/ViewCounter';
import { verifyAdminSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { formatDateKo } from '@/lib/utils/date';
import { extractTextFromTiptap, extractTocFromTiptap } from '@/lib/utils/tiptap';

import type { Metadata, ResolvingMetadata } from 'next';

const getPost = cache(async (id: string) => {
  return supabase.from('posts').select('*').eq('id', id).single();
});

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  const { data: post } = await getPost(id);

  if (!post) {
    return { title: 'Post Not Found' };
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

  const tocItems = extractTocFromTiptap(post.content);

  const [likeStatus, commentsResponse] = await Promise.all([
    getLikeStatus(post.id),
    getComments(post.id),
  ]);

  const initialLikeCount = likeStatus.success ? likeStatus.count || 0 : 0;
  const initialHasLiked = likeStatus.success ? likeStatus.hasLiked || false : false;
  const initialComments =
    commentsResponse.success && commentsResponse.data ? commentsResponse.data : [];

  return (
    <>
      {/* 상단 네비게이션 */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/posts"
          className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>
      </div>

      <div className="relative flex xl:gap-8">
        <ViewCounter postId={post.id} />
        <article className="mx-auto max-w-3xl flex-1">
          <header className="mb-10 text-center">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <time dateTime={post.created_at ? new Date(post.created_at).toISOString() : ''}>
                {formatDateKo(post.created_at)}
              </time>
              <span>·</span>
              <span>{post.author || 'neruu00'}</span>
              <span>·</span>
              <span>조회수 {(post.view_count || 0) + 1}</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-lg prose-orange max-w-none text-gray-700">
            <TiptapViewer content={post.content} />
          </div>

          <div className="mt-12 flex justify-center">
            <LikeButton
              postId={post.id}
              initialLikeCount={initialLikeCount}
              initialHasLiked={initialHasLiked}
            />
          </div>

          {isAdmin && (
            <div className="mt-16 flex justify-end gap-3 border-t border-gray-100 pt-6">
              <Link
                href={`/edit/${post.id}`}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                수정
              </Link>
              <DeletePostButton postId={post.id} />
            </div>
          )}

          <CommentSection postId={post.id} initialComments={initialComments as any} />
        </article>

        <div className="hidden xl:block">
          <TableOfContents items={tocItems} />
        </div>
      </div>
    </>
  );
}

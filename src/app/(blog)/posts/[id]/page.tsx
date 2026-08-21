/**
 * @file page.tsx
 * @description 게시글 상세 페이지.
 *              게시글 제목, 메타 정보, 본문(Tiptap)을 표시한다.
 *              admin인 경우 수정/삭제 버튼을 표시한다.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';

import { getComments } from '@/actions/comment';
import BackLink from '@/components/common/BackLink';
import CommentSection from '@/components/post/CommentSection';
import DeletePostButton from '@/components/post/DeletePostButton';
import PostExportButtons from '@/components/post/PostExportButtons';
import PostNavigation from '@/components/post/PostNavigation';
import TableOfContents from '@/components/post/TableOfContents';
import ViewCounter from '@/components/post/ViewCounter';
import Skeleton from '@/components/ui/Skeleton';
import TagBadge from '@/components/ui/TagBadge';
import { isAdmin as checkIsAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { formatDateKo } from '@/lib/utils/date';
import { extractTextFromTiptap, extractTocFromTiptap } from '@/lib/utils/tiptap';

import type { JSONContent } from '@tiptap/react';
import type { Metadata, ResolvingMetadata } from 'next';

/**
 * TiptapViewer는 Tiptap 런타임 전체를 포함하는 heavy bundle이다.
 * dynamic import로 분리하여 게시글 목록 등 다른 페이지의 초기 번들에서 제외한다.
 * SEO를 위해 ssr: true 를 유지하고 클라이언트에서 Hydration만 지연한다.
 */
const TiptapViewer = dynamic(() => import('@/components/editor/TiptapViewer'), {
  ssr: true,
  loading: () => (
    <div className="space-y-3 py-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${85 - i * 5}%` }} />
      ))}
    </div>
  ),
});

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

async function PostCommentSection({ postId }: { postId: string }) {
  const commentsResponse = await getComments(postId);
  const initialComments =
    commentsResponse.success && commentsResponse.data ? commentsResponse.data : [];

  return <CommentSection postId={postId} initialComments={initialComments} />;
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isAdmin = await checkIsAdmin();
  const { data: post, error } = await getPost(id);

  if (error || !post) notFound();

  // 이전(더 오래된)/다음(더 최신) 글 — 목록 정렬 기준인 created_at으로 인접 글을 찾는다
  const [{ data: prevPost }, { data: nextPost }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title')
      .lt('created_at', post.created_at)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('posts')
      .select('id, title')
      .gt('created_at', post.created_at)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const tocItems = extractTocFromTiptap(post.content);

  return (
    <>
      {/* 상단 네비게이션 */}
      <BackLink href="/posts">목록으로</BackLink>

      <div className="relative flex xl:gap-8">
        <ViewCounter postId={post.id} />
        <article className="mx-auto max-w-3xl flex-1">
          {/* 좌측 정렬 + text-3xl — 목록(PageHeader)·뉴스 상세와 제목 위계·정렬 통일 */}
          <header className="mb-10">
            <h1 className="mb-4 text-3xl leading-snug font-bold tracking-tight text-gray-900">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <time dateTime={post.created_at ? new Date(post.created_at).toISOString() : ''}>
                {formatDateKo(post.created_at)}
              </time>
              <span>·</span>
              <span>{post.author || 'neruu00'}</span>
              <span>·</span>
              <span>조회수 {post.view_count || 0}</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-lg prose-orange max-w-none text-gray-900">
            <TiptapViewer content={post.content} />
          </div>

          <div className="mt-16 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <PostExportButtons title={post.title} content={post.content as JSONContent} />
            {isAdmin && (
              <>
                <Link
                  href={`/edit/${post.id}`}
                  className="flex h-10 items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
                >
                  수정
                </Link>
                <DeletePostButton postId={post.id} />
              </>
            )}
          </div>

          <PostNavigation prev={prevPost} next={nextPost} />

          <Suspense fallback={<Skeleton className="mt-16 h-32 w-full rounded-xl" />}>
            <PostCommentSection postId={post.id} />
          </Suspense>
        </article>

        <div className="hidden xl:block">
          <TableOfContents items={tocItems} />
        </div>
      </div>
    </>
  );
}

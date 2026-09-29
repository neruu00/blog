/**
 * @file page.tsx
 * @description 게시글 상세 페이지. 본문, 목차, 시리즈 목록, 이전/다음 글, 댓글을 보여주고
 *              관리자에게는 수정·삭제 버튼을 보여준다.
 */

import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';

import { getComments } from '@/actions/comment';
import AdjacentNav from '@/components/common/AdjacentNav';
import BackLink from '@/components/common/BackLink';
import CommentSection from '@/components/post/CommentSection';
import DeletePostButton from '@/components/post/DeletePostButton';
import PostContent from '@/components/post/PostContent';
import PostExportButtons from '@/components/post/PostExportButtons';
import PostSeriesList from '@/components/post/PostSeriesList';
import TableOfContents from '@/components/post/TableOfContents';
import ViewCounter from '@/components/post/ViewCounter';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import TagBadge from '@/components/ui/TagBadge';
import { isAdmin as checkIsAdmin } from '@/lib/auth';
import { getPostSeries } from '@/lib/series';
import { supabase } from '@/lib/supabase';
import { formatDateKo } from '@/lib/utils/date';
import { extractTextFromTiptap, extractTocFromTiptap } from '@/lib/utils/tiptap';
import type { PostSeries, SeriesPost } from '@/types/series.type';

import type { JSONContent } from '@tiptap/react';
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

async function PostCommentSection({ postId }: { postId: string }) {
  const commentsResponse = await getComments(postId);
  const initialComments =
    commentsResponse.success && commentsResponse.data ? commentsResponse.data : [];

  return <CommentSection postId={postId} initialComments={initialComments} />;
}

interface Neighbors {
  prev: SeriesPost | null;
  next: SeriesPost | null;
}

/** 시리즈 글은 시리즈 안 앞뒤 편을 이전/다음 글로 삼는다. */
function getSeriesNeighbors(series: PostSeries, postId: string): Neighbors {
  const index = series.posts.findIndex((p) => p.id === postId);
  return {
    prev: series.posts[index - 1] ?? null,
    next: series.posts[index + 1] ?? null,
  };
}

/** 시리즈가 없는 글은 목록과 같은 created_at 기준으로 더 오래된 글을 이전, 더 최신 글을 다음으로 삼는다. */
async function getChronologicalNeighbors(createdAt: string): Promise<Neighbors> {
  const [{ data: prev }, { data: next }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title')
      .lt('created_at', createdAt)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('posts')
      .select('id, title')
      .gt('created_at', createdAt)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  return { prev, next };
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isAdmin = await checkIsAdmin();
  const { data: post, error } = await getPost(id);

  if (error || !post) notFound();

  const series = post.series_id ? await getPostSeries(post.series_id) : null;
  const { prev: prevPost, next: nextPost } = series
    ? getSeriesNeighbors(series, post.id)
    : await getChronologicalNeighbors(post.created_at);

  const tocItems = extractTocFromTiptap(post.content);

  return (
    <>
      <BackLink href="/posts">목록으로</BackLink>

      <div className="relative flex xl:gap-8">
        <ViewCounter postId={post.id} />
        <article className="mx-auto max-w-3xl flex-1">
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
          {series && <PostSeriesList series={series} currentPostId={post.id} />}
          <PostContent content={post.content as JSONContent} toc={tocItems} />

          <div className="mt-16 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <PostExportButtons title={post.title} content={post.content as JSONContent} />
            {isAdmin && (
              <>
                <Button href={`/edit/${post.id}`} variant="outline">
                  수정
                </Button>
                <DeletePostButton postId={post.id} />
              </>
            )}
          </div>

          <AdjacentNav
            prev={prevPost && { href: `/posts/${prevPost.id}`, title: prevPost.title }}
            next={nextPost && { href: `/posts/${nextPost.id}`, title: nextPost.title }}
            prevLabel="이전 글"
            nextLabel="다음 글"
          />

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

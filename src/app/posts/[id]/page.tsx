// src/app/posts/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import TiptapViewer from '@/components/editor/TiptapViewer'; // 방금 만든 뷰어 임포트
import { mockPosts } from '@/mocks/mockPosts';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  // URL에서 넘어온 id를 숫자로 변환하여 MOCK 데이터 배열에서 찾습니다.
  const postId = parseInt(params.id, 10);
  const post = mockPosts[postId];

  // 포스트가 없거나 id가 숫자가 아니면 404 페이지로 보냅니다.
  if (!post || isNaN(postId)) {
    notFound();
  }

  // 날짜 포맷팅
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(post.createdAt);

  return (
    // 메인 페이지와 통일된 배경색을 사용하지만, 글 읽기에 집중하도록 max-w-3xl 로 너비를 좁혔습니다.
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-[#0a0a0a]">
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        {/* 뒤로 가기 버튼 */}
        <Link
          href="/posts"
          className="mb-12 inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-orange-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Link>

        {/* 게시글 헤더 영역 */}
        <header className="mb-10">
          <div className="mb-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
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
              <span className="font-medium text-gray-900 dark:text-neutral-200">{post.author}</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-neutral-700" />
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.createdAt.toISOString()}>{formattedDate}</time>
            </div>
          </div>
        </header>

        {/* 게시글 본문 (Tiptap Viewer 컴포넌트 렌더링) */}
        <article className="mt-10 min-h-[50vh]">
          <TiptapViewer content={post.content} />
        </article>
      </div>
    </main>
  );
}

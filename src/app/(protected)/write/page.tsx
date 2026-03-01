'use client';

import { JSONContent } from '@tiptap/react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createPost } from '@/actions/post';
import TiptapEditor from '@/components/editor/TiptapEditor';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content || (content.content?.length === 1 && !content.content[0].content)) {
      alert('내용을 작성해주세요.');
      return;
    }

    if (!title.trim()) {
      alert('제목과 내용을 모두 작성해주세요.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', JSON.stringify(content));

    const result = await createPost(formData);

    // TODO - 성공 시 게시글 상세 페이지로 이동하도록 수정
    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      alert(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <form onSubmit={handleSubmit}>
        <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">새 글 작성</h1>
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-6 py-2 font-medium text-white shadow-sm transition-colors hover:bg-orange-600"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : '출간하기'}
          </button>
        </div>

        <div className="space-y-6">
          {/* 제목 입력란 */}
          <input
            type="text"
            placeholder="제목을 입력하세요"
            onChange={(e) => setTitle(e.target.value)}
            className="dark:prose-invert mx-auto block w-full max-w-4xl border-none bg-transparent text-4xl font-bold text-gray-900 placeholder-gray-300 outline-none"
          />

          <br />

          {/* Tiptap 에디터 */}
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </form>
    </main>
  );
}

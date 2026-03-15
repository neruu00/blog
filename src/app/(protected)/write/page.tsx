'use client';

import { JSONContent } from '@tiptap/react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createPost } from '@/actions/post';
import TiptapEditor from '@/components/editor/TiptapEditor';
import TagInputField from '@/components/editor/TagInputField';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!title.trim()) {
      alert('제목을 작성해주세요.');
      return;
    }

    if (!content || (content.content?.length === 1 && !content.content[0].content)) {
      alert('내용을 작성해주세요.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', JSON.stringify(content));
    formData.append('tags', JSON.stringify(tags));

    const result = await createPost(formData);

    if (result.success) {
      router.push(`/posts/${result.postId}`);
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
          <input
            type="text"
            placeholder="제목을 입력하세요"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            className="dark:prose-invert mx-auto block w-full max-w-4xl border-none bg-transparent text-4xl font-bold text-gray-900 placeholder-gray-300 outline-none"
          />

          <TagInputField tags={tags} onChange={setTags} />
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </form>
    </main>
  );
}

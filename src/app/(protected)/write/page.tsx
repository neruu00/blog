'use client';

import { JSONContent } from '@tiptap/react';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createPost } from '@/actions/post';
import TiptapEditor from '@/components/editor/TiptapEditor';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');

      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

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
          {/* 제목 입력란 */}
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

          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-2 border-b border-gray-100 dark:border-neutral-800">
            {/* 생성된 태그 칩들 */}
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-full bg-orange-50 py-1.5 pr-2 pl-3 text-sm font-medium text-orange-600 transition-colors dark:bg-orange-500/10 dark:text-orange-400"
              >
                {tag}
                <button
                  type="button" // 폼 제출 방지
                  onClick={() => removeTag(tag)}
                  className="rounded-full p-0.5 hover:bg-orange-200 hover:text-orange-800 dark:hover:bg-orange-500/20 dark:hover:text-orange-300"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}

            {/* 태그 입력 인풋 */}
            <input
              type="text"
              placeholder={tags.length === 0 ? '태그를 입력하고 Enter를 누르세요' : ''}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="min-w-50 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          {/* Tiptap 에디터 */}
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </form>
    </main>
  );
}

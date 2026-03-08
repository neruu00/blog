// src/app/(admin)/edit/[id]/EditPostClient.tsx
'use client';

import { JSONContent } from '@tiptap/react';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updatePost } from '@/actions/post';
import TiptapEditor from '@/components/editor/TiptapEditor';

interface EditPostClientProps {
  post: {
    id: string;
    title: string;
    content: string;
    tags: string[];
  };
}

export default function EditPostClient({ post }: EditPostClientProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState<JSONContent | null>(JSON.parse(post.content));
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmpty = !content || (content.content?.length === 1 && !content.content[0].content);
    if (!title.trim() || isEmpty) {
      alert('제목과 내용을 모두 작성해주세요.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('postId', post.id); // 수정은 게시글 ID가 필수!
    formData.append('title', title);
    formData.append('content', JSON.stringify(content));
    formData.append('tags', JSON.stringify(tags));

    // 수정 서버 액션 호출
    const result = await updatePost(formData);

    if (result.success && result.postId) {
      router.push(`/posts/${result.postId}`);
      router.refresh();
    } else {
      alert(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-6 pt-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">게시글 수정</h1>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-w-25 items-center justify-center rounded-xl bg-orange-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-orange-600 disabled:bg-gray-400"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : '수정하기'}
          </button>
        </div>

        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
          className="w-full border-b border-gray-200 bg-transparent py-4 text-4xl font-bold outline-none placeholder:text-gray-300 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-700"
        />

        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4 dark:border-neutral-800">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full bg-orange-50 py-1.5 pr-2 pl-3 text-sm font-medium text-orange-600 transition-colors dark:bg-orange-500/10 dark:text-orange-400"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="rounded-full p-0.5 hover:bg-orange-200 hover:text-orange-800 dark:hover:bg-orange-500/20 dark:hover:text-orange-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={tags.length === 0 ? '태그를 입력하고 Enter를 누르세요' : ''}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="min-w-50 flex-1 bg-transparent py-1.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-300 dark:placeholder:text-gray-600"
          />
        </div>

        <div className="min-h-125 w-full pb-20">
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </form>
    </main>
  );
}

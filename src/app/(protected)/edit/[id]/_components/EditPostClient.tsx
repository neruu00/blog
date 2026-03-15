'use client';

import { JSONContent } from '@tiptap/react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updatePost } from '@/actions/post';
import TagInputField from '@/components/editor/TagInputField';
import TiptapEditor from '@/components/editor/TiptapEditor';

interface EditPostClientProps {
  post: {
    id: string;
    title: string;
    content: JSONContent;
    tags: string[];
  };
}

export default function EditPostClient({ post }: EditPostClientProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState<JSONContent>(post.content);
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmpty = !content || (content.content?.length === 1 && !content.content[0].content);
    if (!title.trim() || isEmpty) {
      alert('제목과 내용을 모두 작성해주세요.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('postId', post.id);
    formData.append('title', title);
    formData.append('content', JSON.stringify(content));
    formData.append('tags', JSON.stringify(tags));

    const result = await updatePost(formData);

    if (result.success) {
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

        <div className="space-y-6">
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

          <TagInputField tags={tags} onChange={setTags} />
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </form>
    </main>
  );
}

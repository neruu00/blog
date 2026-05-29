'use client';

import { useEditorStore } from '@/stores/useEditorStore';

interface PostTitleInputProps {
  mode: 'create' | 'edit';
}

export default function PostTitleInput({ mode }: PostTitleInputProps) {
  const title = useEditorStore((state) => state.title);
  const setTitle = useEditorStore((state) => state.setTitle);

  return (
    <div className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between">
      <div className="flex-1 space-y-[8px]">
        <label className="text-[12px] font-bold tracking-widest text-orange-500 uppercase">
          {mode === 'create' ? 'NEW POST' : 'EDIT POST'}
        </label>
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
          className="block w-full border-none bg-transparent text-4xl font-bold text-gray-900 placeholder-gray-300 outline-none dark:text-white dark:placeholder:text-neutral-700"
        />
      </div>
    </div>
  );
}

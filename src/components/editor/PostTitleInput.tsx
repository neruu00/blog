'use client';

import SeriesButton from '@/components/editor/SeriesButton';
import { useEditorStore } from '@/stores/useEditorStore';
import type { SeriesOption } from '@/types/series.type';

interface PostTitleInputProps {
  mode: 'create' | 'edit';
  seriesOptions: SeriesOption[];
  postId?: string;
}

export default function PostTitleInput({ mode, seriesOptions, postId }: PostTitleInputProps) {
  const title = useEditorStore((state) => state.title);
  const setTitle = useEditorStore((state) => state.setTitle);

  return (
    <div className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between">
      <div className="flex-1 space-y-[8px]">
        <label className="text-xs font-bold tracking-widest text-orange-500 uppercase">
          {mode === 'create' ? 'NEW POST' : 'EDIT POST'}
        </label>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <SeriesButton options={seriesOptions} postId={postId} />
          <input
            type="text"
            aria-label="제목"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            className="block min-w-0 flex-1 basis-64 border-none bg-transparent text-4xl font-bold text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}

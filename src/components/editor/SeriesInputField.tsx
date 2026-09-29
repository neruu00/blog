'use client';

/**
 * @file SeriesInputField.tsx
 * @description 게시글을 넣을 시리즈와 시리즈 안 순서를 고르는 입력칸.
 *              목록에 없는 이름을 입력하면 저장할 때 새 시리즈가 만들어진다.
 */

import { Library, X } from 'lucide-react';
import { useState } from 'react';

import type { SeriesOption } from '@/types/series.type';

interface SeriesInputFieldProps {
  options: SeriesOption[];
  seriesTitle: string;
  seriesOrder: number | null;
  /** 수정 중인 글이 원래 속해 있던 시리즈. 같은 시리즈에 남으면 순서 기본값을 원래 순서로 보여 준다 */
  initialSeriesTitle?: string;
  initialSeriesOrder?: number | null;
  onSeriesTitleChange: (seriesTitle: string) => void;
  onSeriesOrderChange: (seriesOrder: number | null) => void;
}

export default function SeriesInputField({
  options,
  seriesTitle,
  seriesOrder,
  initialSeriesTitle,
  initialSeriesOrder,
  onSeriesTitleChange,
  onSeriesOrderChange,
}: SeriesInputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const keyword = seriesTitle.trim().toLowerCase();
  const suggestions = options.filter(
    (option) => option.title !== seriesTitle && option.title.toLowerCase().includes(keyword),
  );
  const selected = options.find((option) => option.title === seriesTitle.trim());
  const isNewSeries = keyword !== '' && !selected;

  // 비워 두면 서버가 정하는 순서를 placeholder로 미리 보여 준다
  const defaultOrder =
    seriesTitle.trim() === initialSeriesTitle && initialSeriesOrder
      ? initialSeriesOrder
      : (selected?.maxOrder ?? 0) + 1;

  const selectSeries = (title: string) => {
    onSeriesTitleChange(title);
    onSeriesOrderChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key !== 'Enter') return;

    // Enter로 폼이 제출되지 않게 막고, 후보가 있으면 첫 번째 후보를 고른다
    e.preventDefault();
    if (keyword && suggestions.length > 0) selectSeries(suggestions[0].title);
    e.currentTarget.blur();
  };

  return (
    <div className="relative flex items-center gap-3 border-b border-gray-100 pb-3">
      <Library className="size-4 flex-shrink-0 text-gray-400" aria-hidden />

      <input
        type="text"
        aria-label="시리즈"
        placeholder="시리즈 (선택)"
        value={seriesTitle}
        maxLength={100}
        onChange={(e) => selectSeries(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
      />

      {isNewSeries && <span className="flex-shrink-0 text-xs text-gray-500">새 시리즈</span>}

      {seriesTitle && (
        <>
          <label className="flex flex-shrink-0 items-center gap-1.5 text-sm text-gray-500">
            <input
              type="number"
              min={1}
              aria-label="시리즈 순서"
              placeholder={String(defaultOrder)}
              value={seriesOrder ?? ''}
              onChange={(e) => {
                const value = e.target.valueAsNumber;
                onSeriesOrderChange(Number.isInteger(value) && value >= 1 ? value : null);
              }}
              className="w-14 rounded-md bg-gray-50 px-2 py-1 text-right text-gray-900 outline-none placeholder:text-gray-400 focus:bg-orange-50"
            />
            번째
          </label>

          <button
            type="button"
            aria-label="시리즈에서 빼기"
            onClick={() => selectSeries('')}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="size-3.5" />
          </button>
        </>
      )}

      {isFocused && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 z-50 mt-2 max-h-48 w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
          {suggestions.map((option) => (
            <li
              key={option.id}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSeries(option.title);
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-900 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              {option.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

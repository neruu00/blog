'use client';

/**
 * @file SeriesButton.tsx
 * @description 제목 입력칸 앞의 시리즈 버튼. 고른 시리즈를 `[시리즈 이름]`으로 보여 줘 제목 앞에 붙을 모습을 미리 보여 주고,
 *              누르면 시리즈 다이얼로그를 연다.
 */

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { EMPTY_SERIES_SELECTION, useEditorStore } from '@/stores/useEditorStore';
import { useModalStore } from '@/stores/useModalStore';
import type { SeriesOption } from '@/types/series.type';

import SeriesDialog from './SeriesDialog';

interface SeriesButtonProps {
  options: SeriesOption[];
  /** 수정 중인 글의 id. 새 글이면 없다 */
  postId?: string;
}

export default function SeriesButton({ options, postId }: SeriesButtonProps) {
  const router = useRouter();
  const series = useEditorStore((state) => state.series);
  const setSeries = useEditorStore((state) => state.setSeries);
  const { open, close } = useModalStore();

  const selectedTitle = series.newSeriesTitle
    ? series.newSeriesTitle
    : options.find((option) => option.id === series.seriesId)?.title;
  // 임시저장에서 불러온 시리즈가 그사이 삭제된 경우. 저장하면 서버가 에러를 돌려준다
  const isMissing = series.seriesId !== null && !selectedTitle;

  const openDialog = () => {
    open(
      <SeriesDialog
        options={options}
        postId={postId}
        postTitle={useEditorStore.getState().title}
        initialSelection={series}
        onApply={(selection) => {
          setSeries(selection);
          close();
        }}
        onClose={close}
        onSeriesChanged={() => router.refresh()}
        onSeriesDeleted={(seriesId) => {
          if (useEditorStore.getState().series.seriesId === seriesId) {
            setSeries(EMPTY_SERIES_SELECTION);
          }
          router.refresh();
        }}
      />,
    );
  };

  if (!selectedTitle && !isMissing) {
    return (
      <Button variant="ghost" size="sm" className="flex-shrink-0 px-3" onClick={openDialog}>
        <Plus className="size-4" />
        시리즈
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      aria-label={isMissing ? '삭제된 시리즈, 다시 선택하기' : `시리즈 ${selectedTitle}, 변경하기`}
      onClick={openDialog}
      className={cn(
        'h-auto flex-shrink-0 px-1 text-4xl font-bold hover:bg-orange-50',
        isMissing ? 'text-gray-400 hover:text-gray-500' : 'text-orange-500 hover:text-orange-600',
      )}
    >
      [{isMissing ? '삭제된 시리즈' : selectedTitle}]
    </Button>
  );
}

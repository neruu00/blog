'use client';

/**
 * @file SeriesDialog.tsx
 * @description 글 작성·수정 화면의 시리즈 다이얼로그. 전역 Modal 안에 렌더링한다.
 *              위쪽 "이 글의 시리즈"(선택·새로 만들기·위치)는 적용하면 에디터에 담기고 글을 저장할 때 반영된다.
 *              아래쪽 "시리즈 관리"(이름 변경·삭제)는 다른 글에도 영향을 주므로 누르는 즉시 반영된다.
 */

import { Pencil, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';

import { deleteSeries, renameSeries } from '@/actions/series';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { EMPTY_SERIES_SELECTION, type SeriesSelection } from '@/stores/useEditorStore';
import { useToastStore } from '@/stores/useToastStore';
import type { SeriesOption } from '@/types/series.type';

import SeriesOrderList from './SeriesOrderList';

type Choice = { type: 'none' } | { type: 'existing'; id: string } | { type: 'new' };

interface SeriesDialogProps {
  options: SeriesOption[];
  /** 수정 중인 글의 id. 새 글이면 없다 */
  postId?: string;
  /** 순서 목록의 "이 글" 행에 표시할 제목 */
  postTitle: string;
  initialSelection: SeriesSelection;
  onApply: (selection: SeriesSelection) => void;
  onClose: () => void;
  /** 이름 변경·삭제가 반영된 뒤 호출된다. 페이지 데이터를 새로 받아 오는 데 쓴다 */
  onSeriesChanged: () => void;
  onSeriesDeleted: (seriesId: string) => void;
}

/** 에디터의 선택을 다이얼로그 선택지로 바꾼다. 그사이 삭제된 시리즈는 "시리즈 없음"으로 시작한다 */
function toChoice(selection: SeriesSelection, options: SeriesOption[]): Choice {
  if (selection.newSeriesTitle) return { type: 'new' };
  if (selection.seriesId && options.some((option) => option.id === selection.seriesId)) {
    return { type: 'existing', id: selection.seriesId };
  }
  return { type: 'none' };
}

export default function SeriesDialog({
  options,
  postId,
  postTitle,
  initialSelection,
  onApply,
  onClose,
  onSeriesChanged,
  onSeriesDeleted,
}: SeriesDialogProps) {
  const [seriesList, setSeriesList] = useState(options);
  const [choice, setChoice] = useState<Choice>(() => toChoice(initialSelection, options));
  const [newTitle, setNewTitle] = useState(initialSelection.newSeriesTitle);

  const selectedSeries =
    choice.type === 'existing' ? seriesList.find((series) => series.id === choice.id) : undefined;
  const otherPosts = selectedSeries?.posts.filter((post) => post.id !== postId) ?? [];
  // 위치를 건드리지 않았을 때의 자리: 원래 이 시리즈에 있던 글은 제자리, 새로 들어오는 글은 맨 끝
  const originalIndex = selectedSeries?.posts.findIndex((post) => post.id === postId) ?? -1;
  const defaultIndex = originalIndex >= 0 ? originalIndex : otherPosts.length;

  const [placement, setPlacement] = useState<number | null>(() => {
    const after = initialSelection.seriesAfter;
    if (!after || choice.type !== 'existing') return null;
    if (after === 'first') return 0;
    const index = otherPosts.findIndex((post) => post.id === after);
    return index === -1 ? null : index + 1;
  });
  const insertIndex = placement ?? defaultIndex;

  const selectChoice = (next: Choice) => {
    setChoice(next);
    setPlacement(null);
  };

  const handleApply = () => {
    if (choice.type === 'none') {
      onApply(EMPTY_SERIES_SELECTION);
      return;
    }
    if (choice.type === 'new') {
      onApply({ seriesId: null, newSeriesTitle: newTitle.trim(), seriesAfter: null });
      return;
    }

    // 자리를 옮기지 않았으면 서버가 순서를 정하게 둔다
    let seriesAfter: string | null = null;
    if (insertIndex !== defaultIndex) {
      seriesAfter = insertIndex === 0 ? 'first' : otherPosts[insertIndex - 1].id;
    }
    onApply({ seriesId: choice.id, newSeriesTitle: '', seriesAfter });
  };

  const handleRenamed = (seriesId: string, title: string) => {
    setSeriesList((prev) =>
      prev.map((series) => (series.id === seriesId ? { ...series, title } : series)),
    );
    onSeriesChanged();
  };

  const handleDeleted = (seriesId: string) => {
    setSeriesList((prev) => prev.filter((series) => series.id !== seriesId));
    if (choice.type === 'existing' && choice.id === seriesId) selectChoice({ type: 'none' });
    onSeriesDeleted(seriesId);
  };

  const canApply = choice.type !== 'new' || newTitle.trim() !== '';
  const duplicateOfNew =
    choice.type === 'new' && seriesList.some((series) => series.title === newTitle.trim());

  return (
    <div className="flex max-h-[80vh] flex-col">
      <h3 id="modal-title" className="text-xl font-bold text-gray-900">
        시리즈
      </h3>

      <div className="mt-4 min-h-0 flex-1 space-y-6 overflow-y-auto">
        <section aria-labelledby="series-choice-title">
          <h4 id="series-choice-title" className="text-sm font-semibold text-gray-900">
            이 글의 시리즈
          </h4>
          <p id="modal-description" className="mt-0.5 text-xs text-gray-500">
            적용한 뒤 글을 저장하면 반영됩니다.
          </p>

          <div role="radiogroup" className="mt-3 space-y-1">
            <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-50">
              <input
                type="radio"
                name="series-choice"
                checked={choice.type === 'none'}
                onChange={() => selectChoice({ type: 'none' })}
                className="accent-orange-500"
              />
              시리즈 없음
            </label>

            {seriesList.map((series) => (
              <label
                key={series.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="series-choice"
                  checked={choice.type === 'existing' && choice.id === series.id}
                  onChange={() => selectChoice({ type: 'existing', id: series.id })}
                  className="accent-orange-500"
                />
                <span className="min-w-0 flex-1 truncate">{series.title}</span>
                <span className="flex-shrink-0 text-xs text-gray-400">{series.posts.length}편</span>
              </label>
            ))}

            <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-50">
              <input
                type="radio"
                name="series-choice"
                checked={choice.type === 'new'}
                onChange={() => selectChoice({ type: 'new' })}
                className="accent-orange-500"
              />
              <input
                type="text"
                aria-label="새 시리즈 이름"
                placeholder="새 시리즈 만들기"
                value={newTitle}
                maxLength={100}
                onFocus={() => choice.type !== 'new' && selectChoice({ type: 'new' })}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-400"
              />
            </label>
            {duplicateOfNew && (
              <p className="px-2 text-xs text-gray-500">
                같은 이름의 시리즈가 있어 그 시리즈에 들어갑니다.
              </p>
            )}
          </div>

          {choice.type !== 'none' && (
            <div className="mt-4 rounded-xl bg-gray-50 p-3">
              <p className="mb-2 text-xs text-gray-500">
                {otherPosts.length > 0
                  ? '이 글의 위치 — 끌거나 ↑/↓ 키로 옮깁니다'
                  : '이 시리즈의 첫 글입니다'}
              </p>
              <SeriesOrderList
                posts={otherPosts}
                currentTitle={postTitle || '이 글'}
                index={insertIndex}
                onIndexChange={setPlacement}
              />
            </div>
          )}
        </section>

        {seriesList.length > 0 && (
          <section aria-labelledby="series-manage-title" className="border-t border-gray-100 pt-5">
            <h4 id="series-manage-title" className="text-sm font-semibold text-gray-900">
              시리즈 관리
            </h4>
            <p className="mt-0.5 text-xs text-gray-500">
              이름 변경과 삭제는 누르는 즉시 모든 글에 반영됩니다.
            </p>
            <ul className="mt-3 space-y-1">
              {seriesList.map((series) => (
                <SeriesManageItem
                  key={series.id}
                  series={series}
                  onRenamed={handleRenamed}
                  onDeleted={handleDeleted}
                />
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}>
          닫기
        </Button>
        <Button size="sm" className="font-bold" disabled={!canApply} onClick={handleApply}>
          적용
        </Button>
      </div>
    </div>
  );
}

interface SeriesManageItemProps {
  series: SeriesOption;
  onRenamed: (seriesId: string, title: string) => void;
  onDeleted: (seriesId: string) => void;
}

/** 시리즈 관리 목록의 한 행. 이름 변경과 삭제 확인을 행 안에서 처리한다. */
function SeriesManageItem({ series, onRenamed, onDeleted }: SeriesManageItemProps) {
  const addToast = useToastStore((state) => state.addToast);
  const [mode, setMode] = useState<'view' | 'rename' | 'confirmDelete'>('view');
  const [draft, setDraft] = useState(series.title);
  const [isPending, startTransition] = useTransition();

  const submitRename = () => {
    const title = draft.trim();
    if (!title) return;
    if (title === series.title) {
      setMode('view');
      return;
    }

    startTransition(async () => {
      const result = await renameSeries(series.id, title);
      if (!result.success) {
        addToast(result.error, 'error');
        return;
      }
      setMode('view');
      onRenamed(series.id, title);
      addToast('시리즈 이름을 바꿨습니다.', 'success');
    });
  };

  const submitDelete = () => {
    startTransition(async () => {
      const result = await deleteSeries(series.id);
      if (!result.success) {
        addToast(result.error, 'error');
        return;
      }
      onDeleted(series.id);
      addToast('시리즈를 삭제했습니다.', 'success');
    });
  };

  if (mode === 'rename') {
    return (
      <li className="flex items-center gap-2 px-2 py-1">
        <input
          type="text"
          aria-label={`${series.title} 새 이름`}
          value={draft}
          maxLength={100}
          autoFocus
          disabled={isPending}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') {
              e.preventDefault();
              submitRename();
            } else if (e.key === 'Escape') {
              // 전역 Modal이 ESC로 다이얼로그 전체를 닫지 않게 이벤트를 여기서 멈춘다
              e.stopPropagation();
              setDraft(series.title);
              setMode('view');
            }
          }}
          className="min-w-0 flex-1 rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-900 outline-none focus:bg-orange-50"
        />
        <Button
          size="sm"
          className="h-8 px-3"
          disabled={isPending || draft.trim() === ''}
          onClick={submitRename}
        >
          {isPending ? '바꾸는 중...' : '변경'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3"
          disabled={isPending}
          onClick={() => {
            setDraft(series.title);
            setMode('view');
          }}
        >
          취소
        </Button>
      </li>
    );
  }

  if (mode === 'confirmDelete') {
    return (
      <li className="flex items-center gap-2 rounded-lg bg-red-50 px-2 py-1.5">
        <span className="min-w-0 flex-1 text-sm text-gray-900">
          {series.posts.length}개 글이 시리즈에서 빠집니다. 글은 지워지지 않습니다.
        </span>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 px-3"
          disabled={isPending}
          onClick={submitDelete}
        >
          {isPending ? '삭제 중...' : '삭제'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3"
          disabled={isPending}
          onClick={() => setMode('view')}
        >
          취소
        </Button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-1 px-2 py-1">
      <span className="min-w-0 flex-1 truncate text-sm text-gray-900">{series.title}</span>
      <Tooltip text="이름 변경">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`${series.title} 이름 변경`}
          onClick={() => setMode('rename')}
        >
          <Pencil className="size-3.5" />
        </Button>
      </Tooltip>
      <Tooltip text="삭제">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
          aria-label={`${series.title} 삭제`}
          onClick={() => setMode('confirmDelete')}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </Tooltip>
    </li>
  );
}

/**
 * @file EditorActions.tsx
 * @description 작성/수정 페이지 오른쪽 아래에 고정되는 뒤로가기·임시저장·게시 아이콘 버튼 묶음.
 *              위에서 아래로 배치된 순서가 곧 탭 순서이며, 제출 버튼은 맨 아래에 가장 크게 배치한다.
 *
 *              아이콘만 있는 버튼이므로 Tooltip과 aria-label을 모두 지정한다. 터치 기기에서는 툴팁이 표시되지 않는다.
 */

'use client';

import { ArrowLeft, Check, Loader2, Save, Send } from 'lucide-react';

import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';

interface EditorActionsProps {
  mode: 'create' | 'edit';
  isSubmitting: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
}

const FLOATING =
  'rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:translate-y-0 disabled:shadow-lg';

export default function EditorActions({
  mode,
  isSubmitting,
  onBack,
  onSaveDraft,
}: EditorActionsProps) {
  const submitLabel = mode === 'create' ? '게시하기' : '수정하기';
  const SubmitIcon = mode === 'create' ? Send : Check;

  return (
    <div
      data-editor-actions
      className="fixed right-6 bottom-6 z-50 flex flex-col items-center gap-3"
    >
      <Tooltip text="뒤로가기" position="left">
        <Button
          variant="outline"
          size="icon"
          className={`${FLOATING} h-12 w-12`}
          onClick={onBack}
          disabled={isSubmitting}
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Tooltip>

      <Tooltip text="임시저장" position="left">
        <Button
          variant="outline"
          size="icon"
          className={`${FLOATING} h-12 w-12`}
          onClick={onSaveDraft}
          disabled={isSubmitting}
          aria-label="임시저장"
        >
          <Save className="h-5 w-5" />
        </Button>
      </Tooltip>

      <Tooltip text={isSubmitting ? '저장 중…' : submitLabel} position="left">
        <Button
          type="submit"
          size="icon"
          className={`${FLOATING} h-14 w-14`}
          disabled={isSubmitting}
          aria-label={submitLabel}
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <SubmitIcon className="h-6 w-6" />
          )}
        </Button>
      </Tooltip>
    </div>
  );
}

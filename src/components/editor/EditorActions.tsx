/**
 * @file EditorActions.tsx
 * @description 작성/수정 페이지의 플로팅 액션 버튼 묶음.
 *              화면 우하단에 고정되며 뒤로가기·임시저장·게시(수정)를 아이콘으로 제공한다.
 *              위→아래 순서가 곧 탭 순서이고, 주 액션(제출)이 가장 아래·가장 크다.
 *
 *              아이콘 전용이라 Tooltip(마우스·키보드)과 aria-label(스크린리더)로
 *              이름을 각각 준다 — 터치 기기에는 툴팁이 뜨지 않기 때문이다.
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

/** 떠 있는 요소이므로 그림자를 쓴다 (design-system: 그림자는 실제로 떠 있는 것에만) */
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

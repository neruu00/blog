/**
 * @file EditorFooter.tsx
 * @description 게시글 작성/수정 페이지의 Fixed 하단 푸터 컴포넌트.
 *              뒤로가기, Export(PDF/Markdown), 임시저장, 게시하기/수정하기 버튼을 포함한다.
 */

'use client';

import { ArrowLeft, Loader2, Save } from 'lucide-react';

interface EditorFooterProps {
  mode: 'create' | 'edit';
  isSubmitting: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
}

/**
 * Fixed 하단 푸터.
 * 에디터 페이지에서 항상 화면 하단에 고정된다.
 * @param mode - 'create' 또는 'edit' 모드
 */
export default function EditorFooter({
  mode,
  isSubmitting,
  onBack,
  onSaveDraft,
}: EditorFooterProps) {
  return (
    <footer
      data-editor-footer
      className="editor-footer fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-between border-t border-gray-200 bg-white/95 px-6 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm"
    >
      {/* 좌측: 뒤로가기 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          title="뒤로가기"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">뒤로가기</span>
        </button>
      </div>

      {/* 우측: 임시저장 + 제출 */}
      <div className="flex items-center gap-2">
        {/* 임시저장 */}
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="flex h-9 items-center gap-1.5 rounded-full border border-gray-200 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          title="임시저장"
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">임시저장</span>
        </button>

        {/* 게시/수정 제출 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-9 items-center gap-1.5 rounded-full bg-orange-500 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === 'create' ? (
            '게시하기'
          ) : (
            '수정하기'
          )}
        </button>
      </div>
    </footer>
  );
}

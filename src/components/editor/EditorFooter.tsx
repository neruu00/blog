/**
 * @file EditorFooter.tsx
 * @description 게시글 작성/수정 페이지의 Fixed 하단 푸터 컴포넌트.
 *              뒤로가기, Export(PDF/Markdown), 임시저장, 게시하기/수정하기 버튼을 포함한다.
 */

'use client';

import { ArrowLeft, Loader2, Save } from 'lucide-react';

import Button from '@/components/ui/Button';

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
      className="editor-footer shadow-editor-footer fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-between border-t border-gray-200 bg-white/95 px-6 backdrop-blur-sm"
    >
      {/* 좌측: 뒤로가기 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isSubmitting} title="뒤로가기">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">뒤로가기</span>
        </Button>
      </div>

      {/* 우측: 임시저장 + 제출 */}
      <div className="flex items-center gap-2">
        {/* 임시저장 */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          title="임시저장"
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">임시저장</span>
        </Button>

        {/* 게시/수정 제출 버튼 */}
        <Button type="submit" size="sm" className="px-6 font-bold" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === 'create' ? (
            '게시하기'
          ) : (
            '수정하기'
          )}
        </Button>
      </div>
    </footer>
  );
}

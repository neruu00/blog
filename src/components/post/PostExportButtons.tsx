/**
 * @file PostExportButtons.tsx
 * @description 게시글 상세 페이지에서 사용되는 내보내기(PDF/Markdown) 버튼 컴포넌트.
 */

'use client';

import { Download, FileDown, FileText } from 'lucide-react';
import { useState } from 'react';

import { exportToMarkdown, exportToPdf } from '@/lib/export';

import type { JSONContent } from '@tiptap/react';

interface PostExportButtonsProps {
  title: string;
  content: JSONContent;
}

export default function PostExportButtons({ title, content }: PostExportButtonsProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleExportPdf = () => {
    setIsExportOpen(false);
    exportToPdf(title);
  };

  const handleExportMarkdown = () => {
    setIsExportOpen(false);
    exportToMarkdown(title, content);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsExportOpen((prev) => !prev)}
        className="flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        title="내보내기"
      >
        <Download className="h-4 w-4" />
        내보내기
      </button>

      {/* 드롭다운 메뉴 */}
      {isExportOpen && (
        <>
          {/* 바깥 영역 클릭 시 닫기 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExportOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 bottom-12 z-50 min-w-[180px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl">
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              PDF로 내보내기
            </button>
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              <FileDown className="h-4 w-4 flex-shrink-0" />
              Markdown으로 내보내기
            </button>
          </div>
        </>
      )}
    </div>
  );
}

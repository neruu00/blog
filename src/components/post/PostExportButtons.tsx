/**
 * @file PostExportButtons.tsx
 * @description 게시글 상세 페이지에서 사용되는 내보내기(Markdown) 버튼 컴포넌트.
 *              DropdownMenu 프리미티브를 활용한다.
 */

'use client';

import { Download, FileDown } from 'lucide-react';

import Button from '@/components/ui/Button';
import DropdownMenu from '@/components/ui/DropdownMenu';
import { exportToMarkdown } from '@/lib/export';

import type { JSONContent } from '@tiptap/react';

interface PostExportButtonsProps {
  title: string;
  content: JSONContent;
}

export default function PostExportButtons({ title, content }: PostExportButtonsProps) {
  const handleExportMarkdown = () => {
    exportToMarkdown(title, content);
  };

  return (
    <DropdownMenu
      align="right"
      direction="up"
      trigger={(triggerProps) => (
        <Button variant="outline" title="내보내기" {...triggerProps}>
          <Download className="h-4 w-4" />
          내보내기
        </Button>
      )}
    >
      <DropdownMenu.Item onClick={handleExportMarkdown} icon={<FileDown />}>
        Markdown
      </DropdownMenu.Item>
    </DropdownMenu>
  );
}

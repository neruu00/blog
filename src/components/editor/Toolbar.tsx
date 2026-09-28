'use client';

import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Heading3,
  Workflow,
  Table,
  Superscript,
  Subscript,
} from 'lucide-react';
import { useState } from 'react';

import { uploadImage } from '@/actions/image';
import Button from '@/components/ui/Button';
import DropdownMenu from '@/components/ui/DropdownMenu';
import Tooltip from '@/components/ui/Tooltip';
import { convertToWebP } from '@/lib/image-converter';

import type { ButtonHTMLAttributes } from 'react';

interface ToolbarButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  /** 툴팁과 aria-label에 함께 쓰이는 버튼 이름 */
  label: string;
}

/**
 * 툴바 아이콘 버튼. 아이콘만 있으므로 마우스·키보드용 Tooltip과 스크린리더용 aria-label을 함께 단다.
 * 툴팁은 sticky 툴바가 화면 위에 붙어도 잘리지 않도록 아래쪽에 띄운다.
 */
function ToolbarButton({ label, ...rest }: ToolbarButtonProps) {
  return (
    <Tooltip text={label} position="bottom">
      <Button variant="ghost" size="icon" aria-label={label} {...rest} />
    </Tooltip>
  );
}

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const isInsideTable = editor.isActive('table');

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const webpFile = await convertToWebP(file);

        const formData = new FormData();
        formData.append('file', webpFile);

        // 업로드가 끝날 때까지 스켈레톤 이미지 노드를 먼저 넣어 둔다
        editor
          ?.chain()
          .focus()
          .setImage({
            src: '',
            uploading: true,
          })
          .run();

        const result = await uploadImage(formData);

        if (result.success && result.url) {
          // uploading 상태인 이미지 노드를 찾아 실제 URL로 바꾼다
          editor.view.state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.uploading === true) {
              editor
                .chain()
                .setNodeSelection(pos)
                .updateAttributes('image', {
                  src: result.url,
                  uploading: false,
                })
                .focus()
                .run();
              return false;
            }
          });
        } else {
          // 실패하면 스켈레톤 노드를 지운다
          editor.view.state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.uploading === true) {
              editor.chain().setNodeSelection(pos).deleteSelection().run();
              return false;
            }
          });
          alert(result.error);
        }
      } catch (error) {
        console.error('이미지 변환/업로드 중 오류:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    };
    input.click();
  };

  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
      {/* H1~H3 버튼은 ShiftedHeading에 따라 실제로는 level 2~4를 만든다 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-pressed={editor.isActive('heading', { level: 2 })}
        label="제목 1"
      >
        <Heading1 className="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-pressed={editor.isActive('heading', { level: 3 })}
        label="제목 2"
      >
        <Heading2 className="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        aria-pressed={editor.isActive('heading', { level: 4 })}
        label="제목 3"
      >
        <Heading3 className="h-5 w-5" />
      </ToolbarButton>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-pressed={editor.isActive('bold')}
        label="굵게"
      >
        <Bold className="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-pressed={editor.isActive('italic')}
        label="기울임"
      >
        <Italic className="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        aria-pressed={editor.isActive('strike')}
        label="취소선"
      >
        <Strikethrough className="h-5 w-5" />
      </ToolbarButton>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        aria-pressed={editor.isActive('superscript')}
        label="위 첨자"
      >
        <Superscript className="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        aria-pressed={editor.isActive('subscript')}
        label="아래 첨자"
      >
        <Subscript className="h-5 w-5" />
      </ToolbarButton>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-pressed={editor.isActive('codeBlock')}
        label="코드 블록"
      >
        <Code className="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().insertContent({ type: 'mermaidBlock' }).run()}
        aria-pressed={editor.isActive('mermaidBlock')}
        label="다이어그램 (Mermaid)"
      >
        <Workflow className="h-5 w-5" />
      </ToolbarButton>
      <DropdownMenu
        align="left"
        trigger={(triggerProps) => (
          <ToolbarButton aria-pressed={isInsideTable} label="표" {...triggerProps}>
            <Table className="h-5 w-5" />
          </ToolbarButton>
        )}
      >
        <TableMenu editor={editor} isInsideTable={isInsideTable} />
      </DropdownMenu>
      <ToolbarButton onClick={handleImageUpload} label="이미지 업로드">
        <ImageIcon className="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-pressed={editor.isActive('blockquote')}
        label="인용문"
      >
        <Quote className="h-5 w-5" />
      </ToolbarButton>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-pressed={editor.isActive('bulletList')}
        label="글머리 기호 목록"
      >
        <List className="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-pressed={editor.isActive('orderedList')}
        label="번호 목록"
      >
        <ListOrdered className="h-5 w-5" />
      </ToolbarButton>
    </div>
  );
}

/**
 * 테이블 삽입 폼과 행·열 관리 메뉴.
 * DropdownMenu의 children으로만 쓴다 — useClose가 컨텍스트를 필요로 한다.
 */
function TableMenu({ editor, isInsideTable }: { editor: Editor; isInsideTable: boolean }) {
  const close = DropdownMenu.useClose();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const clamp = (value: number) => Math.max(1, Math.min(20, Math.floor(value) || 1));

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: clamp(rows), cols: clamp(cols), withHeaderRow: true })
      .run();
    close();
  };

  if (isInsideTable) {
    return (
      <div className="w-52">
        <div className="px-4 py-1.5 text-xs font-semibold text-gray-400">행/열 관리</div>
        <DropdownMenu.Item
          closeOnClick={false}
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          아래에 행 추가
        </DropdownMenu.Item>
        <DropdownMenu.Item
          closeOnClick={false}
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          오른쪽에 열 추가
        </DropdownMenu.Item>
        <DropdownMenu.Item
          closeOnClick={false}
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          행 삭제
        </DropdownMenu.Item>
        <DropdownMenu.Item
          closeOnClick={false}
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          열 삭제
        </DropdownMenu.Item>
        <div className="my-1 h-px bg-gray-100" />
        <DropdownMenu.Item
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          테이블 삭제
        </DropdownMenu.Item>
      </div>
    );
  }

  return (
    <div className="w-52">
      <div className="px-4 py-1.5 text-xs font-semibold text-gray-400">테이블 삽입</div>
      <div className="flex items-center gap-2 px-4 pb-2">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-gray-400" htmlFor="table-rows">
            행
          </label>
          <input
            id="table-rows"
            type="number"
            min={1}
            max={20}
            value={rows}
            onChange={(e) => setRows(clamp(parseInt(e.target.value, 10)))}
            className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-orange-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-gray-400" htmlFor="table-cols">
            열
          </label>
          <input
            id="table-cols"
            type="number"
            min={1}
            max={20}
            value={cols}
            onChange={(e) => setCols(clamp(parseInt(e.target.value, 10)))}
            className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-orange-400 focus:outline-none"
          />
        </div>
      </div>
      <div className="px-4 pb-2">
        <Button size="sm" className="h-8 w-full" onClick={insertTable}>
          생성하기
        </Button>
      </div>
    </div>
  );
}

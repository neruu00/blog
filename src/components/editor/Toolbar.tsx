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
import { convertToWebP } from '@/lib/image-converter';

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const isInsideTable = editor.isActive('table');

  const handleImageUpload = async () => {
    // 가장 심플한 파일 선택 방식 (input 태그 동적 생성)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // WebP로 변환 (용량 최적화)
        const webpFile = await convertToWebP(file);

        const formData = new FormData();
        formData.append('file', webpFile);

        // 1. 업로드 중인 스켈레톤 먼저 삽입
        // base64로 미리보기 기능을 넣을 수도 있지만, 여기서는 단순 스켈레톤만 표시
        editor
          ?.chain()
          .focus()
          .setImage({
            src: '', // 아직 URL이 없음
            uploading: true,
          })
          .run();

        // 서버 액션 호출하여 업로드
        const result = await uploadImage(formData);

        if (result.success && result.url) {
          // 2. 성공 시 스켈레톤을 실제 이미지로 교체
          // Tiptap의 트랜잭션을 사용하여 현재 로딩 중인 이미지를 찾아 업데이트
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
              return false; // 중단
            }
          });
        } else {
          // 업로드 실패 시 스켈레톤 제거
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
      {/* H1 버튼 — 사용자에게는 H1로 보이나 내부적으로 level: 2 (ShiftedHeading) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-pressed={editor.isActive('heading', { level: 2 })}
        title="Heading 1"
      >
        <Heading1 className="h-5 w-5" />
      </Button>
      {/* H2 버튼 — 내부적으로 level: 3 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-pressed={editor.isActive('heading', { level: 3 })}
        title="Heading 2"
      >
        <Heading2 className="h-5 w-5" />
      </Button>
      {/* H3 버튼 — 내부적으로 level: 4 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        aria-pressed={editor.isActive('heading', { level: 4 })}
        title="Heading 3"
      >
        <Heading3 className="h-5 w-5" />
      </Button>
      <div className="mx-1 h-6 w-px bg-gray-200" /> {/* 구분선 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-pressed={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-pressed={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        aria-pressed={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="h-5 w-5" />
      </Button>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      {/* Superscript / Subscript */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        aria-pressed={editor.isActive('superscript')}
        title="Superscript (위 첨자)"
      >
        <Superscript className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        aria-pressed={editor.isActive('subscript')}
        title="Subscript (아래 첨자)"
      >
        <Subscript className="h-5 w-5" />
      </Button>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-pressed={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <Code className="h-5 w-5" />
      </Button>
      {/* Mermaid 확장 도구 모음 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'mermaidBlock',
              attrs: {
                code: 'graph TD;\n  A[Start] --> B{Decision};\n  B -->|Yes| C[Result 1];\n  B -->|No| D[Result 2];',
              },
            })
            .run()
        }
        aria-pressed={editor.isActive('mermaidBlock')}
        title="Insert Diagram (Mermaid)"
      >
        <Workflow className="h-5 w-5" />
      </Button>
      {/* 테이블 관리 드롭다운 */}
      <DropdownMenu
        align="left"
        trigger={(triggerProps) => (
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={isInsideTable}
            title="Table Menu"
            {...triggerProps}
          >
            <Table className="h-5 w-5" />
          </Button>
        )}
      >
        <TableMenu editor={editor} isInsideTable={isInsideTable} />
      </DropdownMenu>
      <Button variant="ghost" size="icon" onClick={handleImageUpload} title="Upload Image">
        <ImageIcon className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-pressed={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="h-5 w-5" />
      </Button>
      <div className="mx-1 h-6 w-px bg-gray-200" /> {/* 구분선 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-pressed={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-pressed={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <ListOrdered className="h-5 w-5" />
      </Button>
    </div>
  );
}

/**
 * 테이블 삽입 폼 / 행·열 관리 메뉴.
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

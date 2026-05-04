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
import { useRef, useState } from 'react';

import { uploadImage } from '@/actions/image';
import { convertToWebP } from '@/lib/image-converter';

// https://github.com/wooorm/lowlight
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash/Terminal' },
];

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  if (!editor) return null;

  const isInsideTable = editor.isActive('table');

  const handleInsertTable = (rows: number, cols: number) => {
    const sanitizedRows = Math.max(1, Math.min(20, Math.floor(rows) || 1));
    const sanitizedCols = Math.max(1, Math.min(20, Math.floor(cols) || 1));
    editor
      .chain()
      .focus()
      .insertTable({ rows: sanitizedRows, cols: sanitizedCols, withHeaderRow: true })
      .run();
    setIsTableMenuOpen(false);
  };

  // 버튼 스타일을 통합 관리하는 헬퍼 함수
  const getButtonClass = (isActive: boolean) =>
    `p-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-orange-100 text-orange-600' // 활성화 상태: 오렌지 포인트
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900' // 기본 상태
    }`;

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
    <div className="sticky top-0 z-40 flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white p-2 shadow-sm">
      {/* H1 버튼 — 사용자에게는 H1로 보이나 내부적으로 level: 2 (ShiftedHeading) */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 1"
      >
        <Heading1 className="h-5 w-5" />
      </button>
      {/* H2 버튼 — 내부적으로 level: 3 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 3 }))}
        title="Heading 2"
      >
        <Heading2 className="h-5 w-5" />
      </button>
      {/* H3 버튼 — 내부적으로 level: 4 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 4 }))}
        title="Heading 3"
      >
        <Heading3 className="h-5 w-5" />
      </button>
      <div className="mx-1 h-6 w-px bg-gray-200" /> {/* 구분선 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough className="h-5 w-5" />
      </button>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      {/* Superscript / Subscript */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={getButtonClass(editor.isActive('superscript'))}
        title="Superscript (위 첨자)"
      >
        <Superscript className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={getButtonClass(editor.isActive('subscript'))}
        title="Subscript (아래 첨자)"
      >
        <Subscript className="h-5 w-5" />
      </button>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={getButtonClass(editor.isActive('codeBlock'))}
        title="Code Block"
      >
        <Code className="h-5 w-5" />
      </button>
      {/* Mermaid 확장 도구 모음 */}
      <button
        type="button"
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
        className={getButtonClass(editor.isActive('mermaidBlock'))}
        title="Insert Diagram (Mermaid)"
      >
        <Workflow className="h-5 w-5" />
      </button>
      {/* 테이블 관리 드롭다운 */}
      <div className="relative" ref={tableMenuRef}>
        <button
          type="button"
          onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
          className={getButtonClass(isInsideTable)}
          title="Table Menu"
        >
          <Table className="h-5 w-5" />
        </button>

        {isTableMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsTableMenuOpen(false)} />
            <div className="absolute top-full left-0 z-50 mt-1 w-52 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
              {/* 테이블 밖: 삽입 폼만 표시 */}
              {!isInsideTable && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-400">테이블 삽입</div>
                  <div className="flex items-center gap-2 px-2 pb-2">
                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-xs text-gray-400">행</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={tableRows}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setTableRows(Number.isNaN(val) ? 1 : Math.max(1, Math.min(20, val)));
                        }}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-xs text-gray-400">열</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={tableCols}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setTableCols(Number.isNaN(val) ? 1 : Math.max(1, Math.min(20, val)));
                        }}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="px-2 pb-2">
                    <button
                      type="button"
                      onClick={() => handleInsertTable(tableRows, tableCols)}
                      className="w-full rounded-md bg-orange-500 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                    >
                      생성하기
                    </button>
                  </div>
                </>
              )}

              {/* 테이블 안: 행/열 관리 + 삭제만 표시 */}
              {isInsideTable && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-400">행/열 관리</div>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="flex w-full items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    아래에 행 추가
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="flex w-full items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    오른쪽에 열 추가
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    className="flex w-full items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    행 삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    className="flex w-full items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    열 삭제
                  </button>
                  <div className="my-1 h-px bg-gray-100" />
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteTable().run();
                      setIsTableMenuOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    테이블 삭제
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={handleImageUpload}
        className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-orange-500 dark:text-neutral-400 dark:hover:bg-neutral-800"
        title="Upload Image"
      >
        <ImageIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={getButtonClass(editor.isActive('blockquote'))}
        title="Blockquote"
      >
        <Quote className="h-5 w-5" />
      </button>
      <div className="mx-1 h-6 w-px bg-gray-200" /> {/* 구분선 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass(editor.isActive('orderedList'))}
        title="Ordered List"
      >
        <ListOrdered className="h-5 w-5" />
      </button>
    </div>
  );
}

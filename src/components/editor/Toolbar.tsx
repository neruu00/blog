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
  PenTool,
} from 'lucide-react';

import { uploadImage } from '@/actions/image';

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
  if (!editor) return null;

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

      const formData = new FormData();
      formData.append('file', file);

      // 서버 액션 호출하여 업로드
      const result = await uploadImage(formData);

      if (result.success && result.url) {
        // 성공 시 에디터 커서 위치에 이미지 삽입
        editor?.chain().focus().setImage({ src: result.url }).run();
      } else {
        alert(result.error);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        <Heading1 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 className="h-5 w-5" />
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
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={getButtonClass(editor.isActive('codeBlock'))}
        title="Code Block"
      >
        <Code className="h-5 w-5" />
      </button>
      {editor.isActive('codeBlock') && (
        <>
          <select
            value={editor.getAttributes('codeBlock').language || 'javascript'}
            onChange={(e) => {
              editor.chain().focus().setCodeBlock({ language: e.target.value }).run();
            }}
            className="ml-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-700 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-neutral-700" />
        </>
      )}
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
        onClick={() => editor.chain().focus().insertContent({ type: 'canvas' }).run()}
        className={getButtonClass(editor.isActive('canvas'))}
        title="Insert Canvas"
      >
        <PenTool className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={getButtonClass(editor.isActive('blockquote'))}
        title="Blockquote"
      >
        <Quote className="h-5 w-5" />
      </button>
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

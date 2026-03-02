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
} from 'lucide-react';

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

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 1 }))}
        title="제목 1"
      >
        <Heading1 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 2 }))}
        title="제목 2"
      >
        <Heading2 className="h-5 w-5" />
      </button>
      <div className="mx-1 h-6 w-px bg-gray-200" /> {/* 구분선 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive('bold'))}
        title="굵게"
      >
        <Bold className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive('italic'))}
        title="기울임"
      >
        <Italic className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive('strike'))}
        title="취소선"
      >
        <Strikethrough className="h-5 w-5" />
      </button>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={getButtonClass(editor.isActive('codeBlock'))}
        title="코드 블록"
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
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={getButtonClass(editor.isActive('blockquote'))}
        title="인용구"
      >
        <Quote className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass(editor.isActive('bulletList'))}
        title="글머리 기호"
      >
        <List className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass(editor.isActive('orderedList'))}
        title="번호 매기기"
      >
        <ListOrdered className="h-5 w-5" />
      </button>
    </div>
  );
}

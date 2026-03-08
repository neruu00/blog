'use client';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import { useState } from 'react';

import Toolbar from './Toolbar';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: JSONContent | null;
  onChange: (content: JSONContent) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [_, forceUpdate] = useState(false);

  const editor = useEditor({
    content: content || '',
    immediatelyRender: false, // SSR 에러 방지
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'hljs',
        },
        defaultLanguage: 'javascript',
        enableTabIndentation: true,
        tabSize: 2,
      }),
      Image.configure({ inline: true, allowBase64: true }),
    ],
    editorProps: {
      attributes: {
        // prose는 typography 플러그인 클래스입니다.
        class:
          'prose prose-orange dark:prose-invert max-w-none w-full min-h-[500px] p-6 outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    // 툴바 상태 업데이트용 강제 리렌더링 트리거
    onTransaction: () => {
      forceUpdate((prev) => !prev);
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col border border-gray-200 bg-white shadow-sm transition-all focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400 dark:border-neutral-800 dark:bg-neutral-900">
      <Toolbar editor={editor} />
      <div className="flex-1 cursor-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

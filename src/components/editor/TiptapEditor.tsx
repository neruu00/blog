'use client';

import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';

import { CustomCodeBlock } from './extensions/CustomCodeBlock';
import { CustomImage } from './extensions/CustomImage';
import { MermaidBlock } from './extensions/MermaidBlock';
import Toolbar from './Toolbar';

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
      CustomCodeBlock,
      CustomImage.configure({ inline: true, allowBase64: true }),
      MermaidBlock,
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
    <div className="mx-auto flex w-full max-w-4xl flex-col bg-white dark:bg-neutral-900">
      <Toolbar editor={editor} />
      <div className="flex-1 cursor-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

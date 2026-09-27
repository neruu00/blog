'use client';

import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';

import { CustomCodeBlock } from './extensions/CustomCodeBlock';
import { CustomImage } from './extensions/CustomImage';
import { CustomTable } from './extensions/CustomTable';
import { MermaidBlock } from './extensions/MermaidBlock';
import { ShiftedHeading } from './extensions/ShiftedHeading';
import Toolbar from './Toolbar';

interface TiptapEditorProps {
  content: JSONContent | null;
  onChange: (content: JSONContent) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [_, forceUpdate] = useState(false);

  const editor = useEditor({
    content: content || '',
    immediatelyRender: false, // SSR 중 하이드레이션 불일치를 막는다
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        // 헤딩은 ShiftedHeading이 맡는다
        heading: false,
      }),
      ShiftedHeading,
      CustomCodeBlock,
      CustomImage.configure({ allowBase64: true }),
      MermaidBlock,
      CustomTable,
      Superscript,
      Subscript,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-orange max-w-none w-full min-h-[500px] p-6 outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    // 트랜잭션마다 다시 렌더링해 툴바의 활성 상태를 갱신한다
    onTransaction: () => {
      forceUpdate((prev) => !prev);
    },
  });

  // 툴바는 본문 카드 밖 형제로 둔다. 카드의 overflow-hidden 안에 있으면 sticky가 카드 안에서만 고정되고
  // focus 링도 툴바까지 번진다.
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
      <Toolbar editor={editor} />
      <div className="flex-1 cursor-text overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-200 focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/20">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Toolbar from './Toolbar';
import { useState } from 'react';

export default function TiptapEditor() {
  const [_, forceUpdate] = useState(false); // rerender trigger

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: '<p>여기에 멋진 개발 글을 작성해 보세요...</p>',
    onTransaction: () => {
      forceUpdate((prev) => !prev);
    },
    editorProps: {
      attributes: {
        // prose는 typography 플러그인 클래스입니다. focus 시 오렌지색 링이 생깁니다.
        class: 'prose prose-orange max-w-none w-full min-h-[500px] p-6 focus:outline-none',
      },
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col bg-white shadow-sm border border-gray-200 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400 transition-all">
      {/* 상단 툴바 */}
      <Toolbar editor={editor} />

      {/* 에디터 본문 영역 */}
      <div className="flex-1 cursor-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

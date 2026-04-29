/**
 * @file TiptapViewer.tsx
 * @description Tiptap 에디터 읽기 전용 뷰어 컴포넌트.
 *              게시글 상세 페이지에서 저장된 JSON 콘텐츠를 렌더링한다.
 */

'use client';

import Image from '@tiptap/extension-image';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { CustomCodeBlock } from './extensions/CustomCodeBlock';
import { MermaidBlock } from './extensions/MermaidBlock';

interface TiptapViewerProps {
  content: JSONContent;
}

export default function TiptapViewer({ content }: TiptapViewerProps) {
  const editor = useEditor({
    content,
    editable: false,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CustomCodeBlock,
      Image.configure({ inline: true, allowBase64: true }),
      MermaidBlock,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-orange max-w-none w-full focus:outline-none',
      },
    },
  });

  if (!editor) return <div className="min-h-125 animate-pulse rounded-xl bg-gray-100" />;

  return <EditorContent editor={editor} />;
}

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

interface TiptapViewerProps {
  content: Record<string, any>; // JSON 형태의 Tiptap 데이터
}

export default function TiptapViewer({ content }: TiptapViewerProps) {
  const editor = useEditor({
    editable: false, // 🔥 핵심: 읽기 전용 모드
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'hljs',
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        // prose 클래스를 통해 타이포그래피 스타일을 완벽하게 적용합니다.
        class: 'prose prose-orange dark:prose-invert max-w-none w-full focus:outline-none',
      },
    },
  });

  return <EditorContent editor={editor} />;
}

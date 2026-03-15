'use client';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

interface TiptapViewerProps {
  content: JSONContent;
}

export default function TiptapViewer({ content }: TiptapViewerProps) {
  const editor = useEditor({
    content,
    editable: false, // Read Only
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
      Image.configure({ inline: true, allowBase64: true }),
    ],
    editorProps: {
      attributes: {
        // prose 클래스를 통해 타이포그래피 스타일을 완벽하게 적용합니다.
        class: 'prose prose-orange dark:prose-invert max-w-none w-full focus:outline-none',
      },
    },
  });

  // TODO - skeleton UI 추가하기
  if (!editor) return <div className="min-h-125" />;

  return <EditorContent editor={editor} />;
}

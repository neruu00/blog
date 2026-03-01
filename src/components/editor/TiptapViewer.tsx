'use client';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import { useMemo } from 'react';

const lowlight = createLowlight(common);

interface TiptapViewerProps {
  content: JSONContent | string | any;
}

export default function TiptapViewer({ content }: TiptapViewerProps) {
  const parsedContent = useMemo(() => {
    if (!content) return '';

    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch (e) {
        return content;
      }
    }
    return content;
  }, [content]);

  const editor = useEditor({
    content: parsedContent,
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

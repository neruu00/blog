'use client';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';

import { CanvasExtension } from './extensions/CanvasExtension';

const lowlight = createLowlight(common);

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
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'hljs',
        },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      CanvasExtension,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-orange dark:prose-invert max-w-none w-full focus:outline-none',
      },
    },
  });

  if (!editor)
    return <div className="min-h-125 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800" />;

  return <EditorContent editor={editor} />;
}

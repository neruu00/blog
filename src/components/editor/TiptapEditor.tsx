'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import Toolbar from './Toolbar';
import { useState } from 'react';

const CONTENT = `
<p>
  That's a boring paragraph followed by a fenced code block:
</p>
<pre><code class="language-javascript">for (var i=1; i <= 20; i++)
{
  if (i % 15 == 0)
    console.log("FizzBuzz");
  else if (i % 3 == 0)
    console.log("Fizz");
  else if (i % 5 == 0)
    console.log("Buzz");
  else
    console.log(i);
}</code></pre>
<p>
  Press Command/Ctrl + Enter to leave the fenced code block and continue typing in boring paragraphs.
</p>
`;

const lowlight = createLowlight(common);

export default function TiptapEditor() {
  const editor = useEditor({
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
    ],
    content: CONTENT,
    editorProps: {
      attributes: {
        // prose는 typography 플러그인 클래스입니다. focus 시 오렌지색 링이 생깁니다.
        class:
          'prose prose-orange dark:prose-invert max-w-none w-full min-h-[500px] p-6 focus:outline-none',
      },
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col bg-white dark:bg-neutral-900 shadow-sm border border-gray-200 dark:border-neutral-800 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400 transition-all">
      {/* 상단 툴바 */}
      <Toolbar editor={editor} />
      {/* 에디터 본문 영역 */}
      <div className="flex-1 cursor-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

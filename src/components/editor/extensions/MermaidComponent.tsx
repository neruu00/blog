import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Code, Eye, ExternalLink } from 'lucide-react';
import { useRef, useState } from 'react';

import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';

import MermaidDiagram from './MermaidDiagram';

import type { MouseEvent } from 'react';

export default function MermaidComponent(props: NodeViewProps) {
  const { node, updateAttributes, getPos, editor } = props;
  const [isEditMode, setIsEditMode] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const code = node.attrs.code as string;

  // 다이어그램 종류에 맞는 Mermaid 공식 문서 URL을 돌려준다
  const getDocsUrl = (codeStr: string) => {
    const firstWord =
      codeStr
        .trim()
        .split(/[\s\n]+/)[0]
        ?.toLowerCase() || '';
    if (firstWord.includes('graph') || firstWord.includes('flowchart')) {
      return 'https://mermaid.js.org/syntax/flowchart.html';
    }
    if (firstWord.includes('sequence')) {
      return 'https://mermaid.js.org/syntax/sequenceDiagram.html';
    }
    if (firstWord.includes('mindmap')) {
      return 'https://mermaid.js.org/syntax/mindmap.html';
    }
    return 'https://mermaid.js.org/intro/'; // 기본 링크
  };

  const docsUrl = getDocsUrl(code);

  // textarea를 클릭하면 Tiptap이 이 블록을 선택된 상태로 인식하도록 선택을 옮긴다
  const handleTextareaFocus = () => {
    if (typeof getPos === 'function') {
      const pos = getPos();
      if (typeof pos === 'number') {
        editor.commands.setNodeSelection(pos);
      }
    }
  };

  const isEditable = editor.isEditable;

  // 블록 안 어디를 눌러도 입력창으로 포커스를 옮긴다. 미리보기 중이면 코드 보기로 돌아간다
  const handleBlockClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!isEditable) return;
    if ((e.target as HTMLElement).closest('button, a, textarea')) return;
    setIsEditMode(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <NodeViewWrapper
      onClick={handleBlockClick}
      className={`my-6 overflow-hidden rounded-xl bg-white ${
        isEditable ? 'cursor-text border border-gray-200 shadow-sm' : ''
      }`}
    >
      {isEditable && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-1.5"
          contentEditable={false}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 select-none">
            Diagram
            <Tooltip text="사용법 보기" position="right">
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mermaid 사용법 보기"
                className="flex items-center gap-1 rounded text-xs font-medium transition-colors hover:text-orange-600"
              >
                Mermaid <ExternalLink className="h-3 w-3" />
              </a>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-auto gap-1 px-2 text-xs"
              aria-pressed={isEditMode}
              onClick={() => setIsEditMode(true)}
            >
              <Code className="h-3 w-3" /> Code
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-auto gap-1 px-2 text-xs"
              aria-pressed={!isEditMode}
              onClick={() => setIsEditMode(false)}
            >
              <Eye className="h-3 w-3" /> Preview
            </Button>
          </div>
        </div>
      )}

      {isEditable && isEditMode ? (
        <textarea
          ref={textareaRef}
          className="block field-sizing-content min-h-[150px] w-full resize-none bg-white p-4 font-mono text-sm leading-relaxed text-gray-900 outline-none placeholder:text-gray-400"
          value={code}
          onChange={(e) => updateAttributes({ code: e.target.value })}
          onFocus={handleTextareaFocus}
          placeholder="Mermaid 문법을 작성하세요..."
          spellCheck={false}
        />
      ) : (
        <div className={isEditable ? 'p-4' : 'py-4'}>
          <MermaidDiagram code={code} />
        </div>
      )}
    </NodeViewWrapper>
  );
}

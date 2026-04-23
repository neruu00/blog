import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Code, Eye, ExternalLink } from 'lucide-react';
import mermaid from 'mermaid';
import { useEffect, useState, useRef } from 'react';

// Mermaid 초기화
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose', // 텍스트 렌더링 호환성 향상
});

export default function MermaidComponent(props: NodeViewProps) {
  const { node, updateAttributes, getPos, editor } = props;
  const [isEditMode, setIsEditMode] = useState(true);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const code = node.attrs.code as string;
  // 유니크 아이디 생성 (mermaid.render 시 ID 충돌 방지용)
  const diagramId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  // 작성된 코드에 맞춰 공식 문서 URL 동적 반환
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

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        if (!code.trim()) {
          if (isMounted) setSvgContent('');
          return;
        }

        // 핵심 버그 수정: mermaid.render는 동일한 ID로 두 번 이상 호출 시
        // 다이어그램 타입(Flow, Mindmap 등)에 따라 이전 DOM 캐시가 꼬이는 고질적인 버그가 있습니다.
        // 따라서 토글할 때마다 완전히 새로운 일회용 랜덤 ID를 생성하여 렌더링을 강제합니다.
        const tempId = `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const { svg } = await mermaid.render(tempId, code);

        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Syntax Error in Mermaid code');
      }
    };

    // 읽기 전용이거나 Preview 모드일 때 렌더링
    if (!isEditMode || !editor.isEditable) {
      renderDiagram();
    }

    return () => {
      isMounted = false;
    };
  }, [code, isEditMode, editor.isEditable]);

  // textarea 클릭 시 Tiptap이 이 블록을 '선택된 상태'로 인지하도록 강제
  const handleTextareaFocus = () => {
    if (typeof getPos === 'function') {
      const pos = getPos();
      if (typeof pos === 'number') {
        editor.commands.setNodeSelection(pos);
      }
    }
  };

  const isEditable = editor.isEditable;

  return (
    <NodeViewWrapper
      className={`my-6 overflow-hidden rounded-xl bg-white ${isEditable ? 'border border-gray-200 shadow-sm' : ''}`}
    >
      {/* 툴바 헤더 - 편집 모드에서만 표시 */}
      {isEditable && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-1.5"
          contentEditable={false}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600 select-none">
              Diagram (Mermaid)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 다이어그램 템플릿 셀렉터 */}
            <select
              value={(() => {
                if (code.startsWith('graph') || code.startsWith('flowchart')) return 'flowchart';
                if (code.startsWith('mindmap')) return 'mindmap';
                if (code.startsWith('sequenceDiagram')) return 'sequence';
                return 'custom';
              })()}
              onChange={(e) => {
                const templateType = e.target.value;
                let newCode = '';
                if (templateType === 'flowchart') {
                  newCode =
                    'graph TD;\n  A[Start] --> B{Decision};\n  B -->|Yes| C[Result 1];\n  B -->|No| D[Result 2];';
                } else if (templateType === 'mindmap') {
                  newCode =
                    'mindmap\n  root((Mindmap))\n    Child 1\n      Grandchild 1\n    Child 2';
                } else if (templateType === 'sequence') {
                  newCode =
                    'sequenceDiagram\n  participant Client\n  participant Server\n  Client->>Server: Request\n  Server-->>Client: Response';
                }

                if (newCode) {
                  updateAttributes({ code: newCode });
                  setIsEditMode(true);
                }
              }}
              className="mr-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 outline-none hover:border-gray-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            >
              <option value="custom">Custom Code</option>
              <option value="flowchart">Flowchart</option>
              <option value="mindmap">Mindmap (Tree)</option>
              <option value="sequence">Sequence Diagram</option>
            </select>

            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                isEditMode ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Code className="h-3 w-3" /> Code
            </button>
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                !isEditMode ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Eye className="h-3 w-3" /> Preview
            </button>
          </div>
        </div>
      )}

      {/* 컨텐츠 영역 */}
      <div className={isEditable ? 'p-4' : 'py-4'}>
        {isEditable && isEditMode ? (
          <textarea
            className="min-h-[150px] w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            value={code}
            onChange={(e) => updateAttributes({ code: e.target.value })}
            onFocus={handleTextareaFocus}
            placeholder="Mermaid 문법을 작성하세요..."
            spellCheck={false}
          />
        ) : (
          <div className="flex min-h-[150px] items-center justify-center overflow-x-auto bg-transparent">
            {error ? (
              <div className="w-full rounded-lg bg-red-50 p-4 font-mono text-sm whitespace-pre-wrap text-red-500">
                {error}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: svgContent }} />
            )}
          </div>
        )}
      </div>

      {/* 푸터 영역 - 편집 모드에서만 표시 */}
      {isEditable && (
        <div className="flex items-center justify-end border-t border-gray-200 bg-gray-50 px-4 py-2">
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-orange-600"
            title="해당 다이어그램 문법 보기"
          >
            사용법 보기 <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </NodeViewWrapper>
  );
}

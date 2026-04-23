import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash/Terminal' },
];

export default function CodeBlockComponent({ node, updateAttributes, editor }: NodeViewProps) {
  const isEditable = editor.isEditable;

  return (
    <NodeViewWrapper className="my-6 overflow-hidden rounded-xl border border-neutral-800 bg-[#1e1e1e] shadow-lg">
      {/* Mac 스타일 헤더 */}
      <div
        className="flex items-center border-b border-white/5 bg-[#2d2d2d] px-4 py-1.5"
        contentEditable={false}
      >
        {/* Mac OS 버튼 */}
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* 우측 언어 표시기 / 선택기 */}
        <div className="ml-auto">
          {isEditable ? (
            <select
              className="cursor-pointer bg-transparent text-xs text-neutral-400 outline-none hover:text-white"
              value={node.attrs.language || 'javascript'}
              onChange={(e) => updateAttributes({ language: e.target.value })}
            >
              <option value="null" className="bg-[#2d2d2d] text-white">
                Auto
              </option>
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-[#2d2d2d] text-white">
                  {lang.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-mono text-xs text-neutral-500">
              {node.attrs.language || 'code'}
            </span>
          )}
        </div>
      </div>

      {/* 코드 컨텐츠 */}
      <pre className="m-0 overflow-x-auto bg-transparent p-4 text-sm leading-relaxed text-gray-300 selection:bg-orange-500/30">
        {/* @ts-expect-error: @tiptap/react의 타입 정의가 'code' 태그를 완벽히 지원하지 않아 생기는 TS 에러 */}
        <NodeViewContent as="code" className={`language-${node.attrs.language}`} />
      </pre>
    </NodeViewWrapper>
  );
}

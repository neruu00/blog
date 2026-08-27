import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';

import CodeBlockFrame from './CodeBlockFrame';

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
    <CodeBlockFrame
      as={NodeViewWrapper}
      headerRight={
        isEditable ? (
          <select
            className="bg-transparent text-xs text-neutral-400 outline-none hover:text-white"
            value={node.attrs.language || 'javascript'}
            onChange={(e) => updateAttributes({ language: e.target.value })}
          >
            <option value="null" className="bg-code-block-header text-white">
              Auto
            </option>
            {LANGUAGES.map((lang) => (
              <option
                key={lang.value}
                value={lang.value}
                className="bg-code-block-header text-white"
              >
                {lang.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-mono text-xs text-neutral-500">
            {node.attrs.language || 'code'}
          </span>
        )
      }
    >
      {/* @ts-expect-error: @tiptap/react의 타입 정의가 'code' 태그를 완벽히 지원하지 않아 생기는 TS 에러 */}
      <NodeViewContent as="code" className={`language-${node.attrs.language}`} />
    </CodeBlockFrame>
  );
}

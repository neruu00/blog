/**
 * @file StaticCodeBlock.tsx
 * @description 읽기 화면용 코드블록. 서버에서 highlight.js로 구문 강조를 끝내 HTML로 내보낸다.
 *              토큰 색은 layout.tsx가 전역으로 로드하는 atom-one-dark 테마가 입힌다.
 */

import hljs from 'highlight.js/lib/common';

import CodeBlockFrame from '@/components/editor/extensions/CodeBlockFrame';

interface StaticCodeBlockProps {
  /** 에디터가 저장한 값. 'Auto'는 문자열 'null'로 저장된다 */
  language: string | null;
  code: string;
}

export default function StaticCodeBlock({ language, code }: StaticCodeBlockProps) {
  // 에디터의 Auto와 미등록 언어는 자동 감지 — CodeBlockLowlight가 편집 화면에서 하는 것과 같다
  const known = language && hljs.getLanguage(language) ? language : null;
  const result = known ? hljs.highlight(code, { language: known }) : hljs.highlightAuto(code);

  return (
    <CodeBlockFrame
      headerRight={
        <span className="font-mono text-xs text-neutral-500">
          {known ?? result.language ?? 'code'}
        </span>
      }
    >
      {/* highlight.js가 코드를 이스케이프한 뒤 span만 끼워 넣으므로 안전하다 */}
      <code dangerouslySetInnerHTML={{ __html: result.value }} />
    </CodeBlockFrame>
  );
}

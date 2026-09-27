/**
 * @file CodeBlockFrame.tsx
 * @description Mac 스타일 코드블록 프레임. 에디터 노드뷰(CodeBlockComponent)와 정적 렌더러(StaticCodeBlock)가 함께 쓴다.
 */

import type { ElementType, ReactNode } from 'react';

interface CodeBlockFrameProps {
  /** 바깥 요소. 에디터에서는 NodeViewWrapper여야 하고, 정적 렌더에서는 div를 쓴다 */
  as?: ElementType;
  /** 헤더 우측 영역. 에디터는 언어 <select>, 읽기 화면은 언어 라벨을 넣는다 */
  headerRight: ReactNode;
  children: ReactNode;
}

export default function CodeBlockFrame({
  as: Wrapper = 'div',
  headerRight,
  children,
}: CodeBlockFrameProps) {
  return (
    <Wrapper className="bg-code-block my-6 overflow-hidden rounded-xl border border-neutral-800">
      <div
        className="bg-code-block-header flex items-center border-b border-white/5 px-4 py-1.5"
        contentEditable={false}
      >
        <div className="flex gap-2">
          <div className="bg-mac-red h-3 w-3 rounded-full" />
          <div className="bg-mac-yellow h-3 w-3 rounded-full" />
          <div className="bg-mac-green h-3 w-3 rounded-full" />
        </div>
        <div className="ml-auto">{headerRight}</div>
      </div>

      <pre className="m-0 overflow-x-auto bg-transparent p-4 text-sm leading-relaxed text-gray-400 selection:bg-orange-500/30">
        {children}
      </pre>
    </Wrapper>
  );
}

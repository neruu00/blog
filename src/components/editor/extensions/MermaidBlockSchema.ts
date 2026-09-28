/**
 * @file MermaidBlockSchema.ts
 * @description Mermaid 블록의 스키마(노드 정의)만 담는다. 노드뷰는 MermaidBlock.tsx에서 붙인다.
 *              서버 정적 렌더러(PostContent)가 노드뷰를 포함한 MermaidBlock을 import하면
 *              mermaid 라이브러리 전체가 서버 번들에 들어가므로 파일을 분리했다.
 */

import { Node, mergeAttributes } from '@tiptap/core';

export const MermaidBlockSchema = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  atom: true, // 내부 콘텐츠는 Tiptap이 아니라 NodeView가 관리한다

  addAttributes() {
    return {
      code: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid-block' })];
  },
});

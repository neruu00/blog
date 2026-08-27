/**
 * @file MermaidBlockSchema.ts
 * @description Mermaid 블록의 스키마(노드 정의)만 담는다. 노드뷰는 MermaidBlock.tsx가 붙인다.
 *
 *              분리한 이유: 서버 정적 렌더러(PostContent)는 스키마만 필요한데,
 *              노드뷰가 있는 MermaidBlock을 import하면 mermaid 라이브러리 전체가
 *              서버 번들로 끌려 들어온다.
 */

import { Node, mergeAttributes } from '@tiptap/core';

export const MermaidBlockSchema = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  atom: true, // 내부 콘텐츠를 Tiptap이 관리하지 않고 NodeView가 전적으로 관리하도록 설정

  addAttributes() {
    return {
      code: {
        default: 'graph TD;\n  A-->B;',
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

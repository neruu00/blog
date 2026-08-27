/**
 * @file MermaidBlock.tsx
 * @description 에디터용 Mermaid 블록 — 스키마(MermaidBlockSchema)에 React 노드뷰를 붙인다.
 *              읽기 화면은 이 파일이 아니라 PostContent가 스키마만 써서 정적으로 렌더링한다.
 */

import { ReactNodeViewRenderer } from '@tiptap/react';

import { MermaidBlockSchema } from './MermaidBlockSchema';
import MermaidComponent from './MermaidComponent';

export const MermaidBlock = MermaidBlockSchema.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent);
  },
});

/**
 * @file MermaidBlock.tsx
 * @description 에디터 전용 Mermaid 블록. MermaidBlockSchema에 React 노드뷰를 붙인다.
 *              읽기 화면은 이 파일 대신 스키마만 사용해 PostContent에서 정적으로 렌더링한다.
 */

import { ReactNodeViewRenderer } from '@tiptap/react';

import { MermaidBlockSchema } from './MermaidBlockSchema';
import MermaidComponent from './MermaidComponent';

export const MermaidBlock = MermaidBlockSchema.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent);
  },
});

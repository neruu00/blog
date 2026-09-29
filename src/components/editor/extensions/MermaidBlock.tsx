/**
 * @file MermaidBlock.tsx
 * @description 에디터 전용 Mermaid 블록. MermaidBlockSchema에 React 노드뷰와 입력 규칙을 붙인다.
 *              읽기 화면은 이 파일 대신 스키마만 사용해 PostContent에서 정적으로 렌더링한다.
 */

import { InputRule } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { MermaidBlockSchema } from './MermaidBlockSchema';
import MermaidComponent from './MermaidComponent';

/**
 * 빈 문단에서 백틱 4개 뒤에 Space나 Enter를 누르면 다이어그램 블록으로 바꾼다.
 * 코드 블록 규칙(```)은 네 번째 백틱에서 매치되지 않으므로 두 규칙이 겹치지 않는다.
 */
const MERMAID_INPUT_REGEX = /^````[\s\n]$/;

export const MermaidBlock = MermaidBlockSchema.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent);
  },

  addInputRules() {
    return [
      new InputRule({
        find: MERMAID_INPUT_REGEX,
        handler: ({ state, range }) => {
          const { tr } = state;
          const $from = tr.doc.resolve(range.from);

          // 문단에 다른 글자가 남아 있으면 문단째 바꾸면서 지워지므로 백틱만 있을 때만 바꾼다
          if ($from.parent.textContent !== '````') return null;

          const container = $from.node(-1);
          const index = $from.index(-1);
          if (!container.canReplaceWith(index, index + 1, this.type)) return null;

          const start = $from.before();
          const isLastBlock = $from.indexAfter(-1) === container.childCount;
          const nodes = [this.type.create()];
          // 문서 끝에서 만들면 블록 뒤에 커서를 둘 곳이 없으므로 빈 문단을 하나 붙인다
          if (isLastBlock) nodes.push(state.schema.nodes.paragraph.create());

          tr.replaceWith(start, $from.after(), nodes);
          // 노드뷰가 선택된 빈 블록의 입력창으로 포커스를 옮긴다
          tr.setSelection(NodeSelection.create(tr.doc, start));
        },
      }),
    ];
  },
});

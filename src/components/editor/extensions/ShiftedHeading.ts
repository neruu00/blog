/**
 * @file ShiftedHeading.ts
 * @description 헤딩 레벨을 한 단계씩 내리는 Heading 익스텐션. `# `을 입력하면 h2가 만들어져
 *              페이지의 h1은 게시글 제목 하나로 유지된다.
 *
 * 사용자 입력 → 실제 렌더링 태그
 *   #   → <h2>
 *   ##  → <h3>
 *   ### → <h4>
 */

import { textblockTypeInputRule } from '@tiptap/core';
import Heading from '@tiptap/extension-heading';

/**
 * 마크다운 단축 입력(addInputRules)과 Mod-Alt-1/2/3 단축키(addKeyboardShortcuts)에 레벨 시프트를 적용한다.
 * - h1 태그 파싱은 기본 동작 그대로 유지 (의도적으로 깨진 상태)
 */
export const ShiftedHeading = Heading.extend({
  // h1은 게시글 제목 전용이라 레벨을 2~4로 제한한다
  addOptions() {
    return {
      ...this.parent?.(),
      levels: [2, 3, 4] as const,
      HTMLAttributes: {},
    };
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: new RegExp('^(#)\\s$'),
        type: this.type,
        getAttributes: () => ({ level: 2 }),
      }),
      textblockTypeInputRule({
        find: new RegExp('^(##)\\s$'),
        type: this.type,
        getAttributes: () => ({ level: 3 }),
      }),
      textblockTypeInputRule({
        find: new RegExp('^(###)\\s$'),
        type: this.type,
        getAttributes: () => ({ level: 4 }),
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-1': () => this.editor.commands.toggleHeading({ level: 2 }),
      'Mod-Alt-2': () => this.editor.commands.toggleHeading({ level: 3 }),
      'Mod-Alt-3': () => this.editor.commands.toggleHeading({ level: 4 }),
    };
  },
});

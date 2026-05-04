/**
 * @file ShiftedHeading.ts
 * @description SEO 최적화를 위한 Heading 레벨 오프셋 익스텐션.
 *              사용자가 `# `을 입력하면 내부적으로 H2(level: 2)가 생성되어,
 *              페이지의 H1은 게시글 제목 하나로만 유지된다.
 *
 * 사용자 입력 → 실제 렌더링 태그
 *   #   → <h2>
 *   ##  → <h3>
 *   ### → <h4>
 */

import { textblockTypeInputRule } from '@tiptap/core';
import Heading from '@tiptap/extension-heading';

/**
 * 기본 Heading 익스텐션을 확장하여 레벨을 1단계씩 시프트한다.
 * - addInputRules: 마크다운 단축 입력 오프셋 적용
 * - addKeyboardShortcuts: Mod-Alt-1/2/3 단축키 오프셋 적용
 * - h1 태그 파싱은 기본 동작 그대로 유지 (의도적으로 깨진 상태)
 */
export const ShiftedHeading = Heading.extend({
  // 사용 가능한 레벨을 2~4로 제한 (H1은 게시글 제목만 사용)
  addOptions() {
    return {
      ...this.parent?.(),
      levels: [2, 3, 4] as const,
      HTMLAttributes: {},
    };
  },

  addInputRules() {
    return [
      // 사용자가 '# '을 입력하면 내부적으로는 H2(level: 2)로 변환합니다.
      textblockTypeInputRule({
        find: new RegExp('^(#)\\s$'),
        type: this.type,
        getAttributes: () => ({ level: 2 }),
      }),
      // 사용자가 '## '을 입력하면 H3(level: 3)로 변환합니다.
      textblockTypeInputRule({
        find: new RegExp('^(##)\\s$'),
        type: this.type,
        getAttributes: () => ({ level: 3 }),
      }),
      // 사용자가 '### '을 입력하면 H4(level: 4)로 변환합니다.
      textblockTypeInputRule({
        find: new RegExp('^(###)\\s$'),
        type: this.type,
        getAttributes: () => ({ level: 4 }),
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Mod-Alt-1 → H2 (사용자 인식 H1)
      'Mod-Alt-1': () => this.editor.commands.toggleHeading({ level: 2 }),
      // Mod-Alt-2 → H3 (사용자 인식 H2)
      'Mod-Alt-2': () => this.editor.commands.toggleHeading({ level: 3 }),
      // Mod-Alt-3 → H4 (사용자 인식 H3)
      'Mod-Alt-3': () => this.editor.commands.toggleHeading({ level: 4 }),
    };
  },
});

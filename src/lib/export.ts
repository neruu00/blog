/**
 * @file export.ts
 * @description 게시글 Export 유틸리티.
 *              - exportToMarkdown: JSONContent → Markdown 변환 후 .md 파일 다운로드
 */

import type { JSONContent } from '@tiptap/react';

// ─────────────────────────────────────────────
// Markdown Export — JSONContent → Markdown 변환
// ─────────────────────────────────────────────

/** Tiptap 텍스트 노드의 marks를 Markdown 문법으로 감싼다 */
function applyMarks(text: string, marks: NonNullable<JSONContent['marks']>): string {
  let result = text;

  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        result = `**${result}**`;
        break;
      case 'italic':
        result = `_${result}_`;
        break;
      case 'strike':
        result = `~~${result}~~`;
        break;
      case 'code':
        result = `\`${result}\``;
        break;
      case 'superscript':
        result = `<sup>${result}</sup>`;
        break;
      case 'subscript':
        result = `<sub>${result}</sub>`;
        break;
      case 'link':
        result = `[${result}](${mark.attrs?.href ?? ''})`;
        break;
      default:
        break;
    }
  }

  return result;
}

/** JSONContent 노드를 재귀적으로 Markdown 문자열로 변환한다 */
function nodeToMarkdown(node: JSONContent, listDepth = 0, orderedIndex = 0): string {
  const indent = '  '.repeat(listDepth);

  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map((n) => nodeToMarkdown(n)).join('\n');

    case 'paragraph': {
      const text = (node.content ?? []).map((n) => nodeToMarkdown(n)).join('');
      return text ? `${text}\n` : '\n';
    }

    case 'text': {
      const raw = node.text ?? '';
      return node.marks ? applyMarks(raw, node.marks) : raw;
    }

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      const prefix = '#'.repeat(level);
      const text = (node.content ?? []).map((n) => nodeToMarkdown(n)).join('');
      return `${prefix} ${text}\n`;
    }

    case 'bulletList':
      return (node.content ?? []).map((item) => nodeToMarkdown(item, listDepth)).join('') + '\n';

    case 'orderedList':
      return (
        (node.content ?? []).map((item, i) => nodeToMarkdown(item, listDepth, i + 1)).join('') +
        '\n'
      );

    case 'listItem': {
      const bullet = orderedIndex > 0 ? `${orderedIndex}.` : '-';
      // 첫 번째 자식(paragraph)의 텍스트와 중첩 리스트를 처리
      const children = node.content ?? [];
      const firstParagraph = children[0];
      const firstText =
        firstParagraph?.type === 'paragraph'
          ? (firstParagraph.content ?? []).map((n) => nodeToMarkdown(n)).join('')
          : '';
      const rest = children
        .slice(1)
        .map((n) => nodeToMarkdown(n, listDepth + 1))
        .join('');
      return `${indent}${bullet} ${firstText}\n${rest}`;
    }

    case 'blockquote': {
      const inner = (node.content ?? []).map((n) => nodeToMarkdown(n)).join('');
      return (
        inner
          .split('\n')
          .map((line) => (line ? `> ${line}` : '>'))
          .join('\n') + '\n'
      );
    }

    case 'codeBlock': {
      const lang = (node.attrs?.language as string) ?? '';
      const code = (node.content ?? []).map((n) => n.text ?? '').join('');
      return `\`\`\`${lang}\n${code}\n\`\`\`\n`;
    }

    case 'image': {
      const src = (node.attrs?.src as string) ?? '';
      const alt = (node.attrs?.alt as string) ?? '';
      return `![${alt}](${src})\n`;
    }

    case 'horizontalRule':
      return '---\n';

    case 'hardBreak':
      return '  \n'; // Markdown 줄바꿈

    // ── Table ──────────────────────────────────
    case 'table':
      return (node.content ?? []).map((n) => nodeToMarkdown(n)).join('');

    case 'tableRow': {
      const cells = (node.content ?? [])
        .map((cell) => {
          const cellText = (cell.content ?? [])
            .flatMap((p) => (p.content ?? []).map((n) => nodeToMarkdown(n)))
            .join('')
            .replace(/\|/g, '\\|') // 파이프 이스케이프
            .replace(/\n/g, '<br>'); // 개행을 <br>로 변환
          return ` ${cellText} `;
        })
        .join('|');
      const isHeader = node.content?.some((c) => c.type === 'tableHeader');
      const row = `|${cells}|\n`;
      if (isHeader) {
        const separator = '|' + (node.content ?? []).map(() => ' --- ').join('|') + '|\n';
        return row + separator;
      }
      return row;
    }

    case 'tableHeader':
    case 'tableCell': {
      // tableRow 에서 처리하므로 단독으로는 호출되지 않지만 안전하게 처리
      return (node.content ?? []).map((n) => nodeToMarkdown(n)).join('');
    }

    // ── Mermaid (코드 블록으로 변환) ────────────
    case 'mermaidBlock': {
      const code = (node.attrs?.code as string) ?? '';
      return `\`\`\`mermaid\n${code}\n\`\`\`\n`;
    }

    default:
      // 알 수 없는 노드는 자식 노드를 재귀 처리
      return (node.content ?? []).map((n) => nodeToMarkdown(n)).join('');
  }
}

/**
 * JSONContent를 Markdown 파일로 변환하여 다운로드한다.
 * @param title - 게시글 제목 (파일명 및 문서 제목으로 사용)
 * @param content - Tiptap JSONContent
 */
export function exportToMarkdown(title: string, content: JSONContent): void {
  const body = nodeToMarkdown(content);
  const markdown = `# ${title}\n\n${body}`;

  // 파일명 안전화: 특수문자 제거
  const safeFileName = title.replace(/[^a-zA-Z0-9가-힣\s-_]/g, '').trim() || 'post';

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeFileName}.md`;
  link.click();

  // 메모리 해제
  URL.revokeObjectURL(url);
}

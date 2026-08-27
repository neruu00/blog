/**
 * @file PostContent.tsx
 * @description 게시글 본문을 서버에서 정적으로 렌더링한다 (Tiptap JSON → React).
 *              편집 런타임 없이 HTML이 SSR에 실리므로 검색엔진·링크 미리보기·
 *              헤딩 딥링크가 동작하고, 읽기 페이지 번들에서 Tiptap이 빠진다.
 */

import Image from '@tiptap/extension-image';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import StarterKit from '@tiptap/starter-kit';
import { renderToReactElement } from '@tiptap/static-renderer/pm/react';

import { CustomTable } from '@/components/editor/extensions/CustomTable';
import { MermaidBlockSchema } from '@/components/editor/extensions/MermaidBlockSchema';
import MermaidDiagram from '@/components/editor/extensions/MermaidDiagram';
import { ShiftedHeading } from '@/components/editor/extensions/ShiftedHeading';
import type { TocItem } from '@/lib/utils/tiptap';

import StaticCodeBlock from './StaticCodeBlock';

import type { JSONContent } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';

/**
 * TiptapEditor와 같은 노드·마크 집합. 노드뷰(React)는 필요 없으므로 스키마만 있는 기본 확장을 쓴다.
 * 여기 없는 노드 타입이 JSON에 있으면 렌더가 실패한다 — 에디터에 확장을 추가하면 여기도 추가하라.
 */
const POST_SCHEMA = [
  StarterKit.configure({ heading: false }),
  ShiftedHeading,
  Image,
  MermaidBlockSchema,
  CustomTable,
  Superscript,
  Subscript,
];

const HEADING_LEVELS = [2, 3, 4] as const;
type HeadingLevel = (typeof HEADING_LEVELS)[number];

/**
 * 표 셀 속성을 React 표기로 옮긴다.
 * 정적 렌더러는 class/style 말고는 속성명을 그대로 넘기는데, Tiptap은 이걸
 * HTML 표기(colspan/rowspan)로 내보내 React가 "Did you mean colSpan?"으로 경고한다.
 * 기본값 1은 아예 빼서 마크업을 깨끗하게 둔다. colwidth는 colgroup이 대신 처리한다.
 */
function cellSpanProps(node: PMNode) {
  const colSpan = Number(node.attrs.colspan) || 1;
  const rowSpan = Number(node.attrs.rowspan) || 1;
  return {
    colSpan: colSpan > 1 ? colSpan : undefined,
    rowSpan: rowSpan > 1 ? rowSpan : undefined,
  };
}

/** 첫 행의 colwidth를 colgroup으로 편다 — 에디터에서 조정한 열 너비를 읽기 화면에서도 유지한다 */
function columnWidths(table: PMNode): (number | null)[] {
  const widths: (number | null)[] = [];
  table.firstChild?.forEach((cell) => {
    const colwidth = cell.attrs.colwidth as number[] | null;
    const span = Number(cell.attrs.colspan) || 1;
    for (let i = 0; i < span; i += 1) widths.push(colwidth?.[i] ?? null);
  });
  return widths;
}

interface PostContentProps {
  content: JSONContent;
  /** extractTocFromTiptap 결과 — 목차(TableOfContents)와 같은 배열을 넘겨야 id가 일치한다 */
  toc: TocItem[];
}

export default function PostContent({ content, toc }: PostContentProps) {
  // 목차와 같은 순서로 id를 소비한다. 텍스트 없는 헤딩은 추출기도 건너뛰므로 여기서도 건너뛴다
  const headingIds = toc.map((item) => item.id);
  let headingIndex = 0;

  const body = renderToReactElement({
    content,
    extensions: POST_SCHEMA,
    options: {
      nodeMapping: {
        heading: ({ node, children }) => {
          // ShiftedHeading이 허용하지 않는 레벨(옛 글의 h1 등)은 렌더러와 같이 h2로 떨어뜨린다
          const level: HeadingLevel = HEADING_LEVELS.includes(node.attrs.level)
            ? node.attrs.level
            : 2;
          const Tag = `h${level}` as const;
          const id = node.textContent ? headingIds[headingIndex++] : undefined;
          return (
            <Tag id={id} className="scroll-mt-24">
              {children}
            </Tag>
          );
        },

        codeBlock: ({ node }) => (
          <StaticCodeBlock language={node.attrs.language} code={node.textContent} />
        ),

        image: ({ node }) => (
          <figure className="my-6 overflow-hidden rounded-lg border border-gray-100">
            {/* 업로드 이미지의 원본 크기를 저장하지 않아 next/image(width/height 필수)를 쓸 수 없다 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={node.attrs.src}
              alt={node.attrs.alt ?? ''}
              title={node.attrs.title ?? undefined}
              loading="lazy"
              decoding="async"
              className="h-auto w-full"
            />
          </figure>
        ),

        mermaidBlock: ({ node }) => <MermaidDiagram code={node.attrs.code} />,

        // 에디터는 resizable 노드뷰가 표를 .tableWrapper로 감싸고 colgroup을 그린다.
        // 뷰어에는 그 노드뷰가 없으므로 둘 다 여기서 직접 만든다 — 래퍼가 없으면
        // 넓은 표가 페이지를 가로로 민다 (globals.css .prose .tableWrapper)
        table: ({ node, children }) => {
          const widths = columnWidths(node);
          return (
            <div className="tableWrapper">
              <table>
                {widths.some((w) => w !== null) && (
                  <colgroup>
                    {widths.map((w, i) => (
                      <col key={i} style={w ? { width: `${w}px` } : undefined} />
                    ))}
                  </colgroup>
                )}
                <tbody>{children}</tbody>
              </table>
            </div>
          );
        },

        tableHeader: ({ node, children }) => <th {...cellSpanProps(node)}>{children}</th>,
        tableCell: ({ node, children }) => <td {...cellSpanProps(node)}>{children}</td>,
      },
    },
  });

  return <div className="prose prose-orange max-w-none">{body}</div>;
}

/**
 * @file PostContent.tsx
 * @description 게시글 본문(Tiptap JSON)을 서버에서 React로 정적 렌더링한다.
 *              본문 HTML이 SSR 응답에 포함되어 검색엔진, 링크 미리보기, 헤딩 딥링크가 동작한다.
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
 * TiptapEditor와 같은 노드·마크 집합이다. 노드뷰가 필요하지 않아 스키마만 있는 확장을 쓴다.
 * 여기에 없는 노드 타입이 JSON에 있으면 렌더링에 실패하므로, 에디터에 확장을 추가할 때 여기도 추가한다.
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
 * 표 셀 속성(colspan/rowspan)을 React 표기(colSpan/rowSpan)로 바꾼다.
 * 정적 렌더러는 class/style 외의 속성명을 그대로 넘기므로, 바꾸지 않으면 React가 경고를 낸다.
 * 기본값 1은 출력하지 않고, colwidth는 colgroup에서 처리한다.
 */
function cellSpanProps(node: PMNode) {
  const colSpan = Number(node.attrs.colspan) || 1;
  const rowSpan = Number(node.attrs.rowspan) || 1;
  return {
    colSpan: colSpan > 1 ? colSpan : undefined,
    rowSpan: rowSpan > 1 ? rowSpan : undefined,
  };
}

/** 첫 행의 colwidth로 colgroup을 만들어 에디터에서 조정한 열 너비를 읽기 화면에서도 유지한다 */
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
  // 목차와 같은 순서로 id를 소비한다. 텍스트가 없는 헤딩은 추출기도 건너뛰므로 여기서도 건너뛴다
  const headingIds = toc.map((item) => item.id);
  let headingIndex = 0;

  const body = renderToReactElement({
    content,
    extensions: POST_SCHEMA,
    options: {
      nodeMapping: {
        heading: ({ node, children }) => {
          // ShiftedHeading이 허용하지 않는 레벨(h1 등)이 저장된 글은 h2로 렌더링한다
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

        // 에디터에서는 resizable 노드뷰가 .tableWrapper와 colgroup을 그리지만 정적 렌더에는 그 노드뷰가 없어
        // 여기서 직접 만든다. 래퍼가 없으면 너비가 넓은 표가 페이지를 가로로 밀어낸다 (globals.css .prose .tableWrapper)
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

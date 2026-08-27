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

        // 에디터는 resizable 노드뷰가 표를 .tableWrapper로 감싼다. 뷰어도 같은 래퍼를 둬야
        // 넓은 표가 페이지를 밀지 않고 안에서만 스크롤된다 (globals.css .prose .tableWrapper)
        table: ({ children }) => (
          <div className="tableWrapper">
            <table>
              <tbody>{children}</tbody>
            </table>
          </div>
        ),
      },
    },
  });

  return <div className="prose prose-orange max-w-none">{body}</div>;
}

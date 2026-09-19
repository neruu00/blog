/**
 * @file NewsContent.tsx
 * @description 뉴스 Markdown 본문과 코드·Mermaid 블록을 렌더링한다.
 */

import ReactMarkdown from 'react-markdown';

import MermaidDiagram from '@/components/editor/extensions/MermaidDiagram';
import StaticCodeBlock from '@/components/post/StaticCodeBlock';

interface NewsContentProps {
  content: string;
}

export default function NewsContent({ content }: NewsContentProps) {
  return (
    <div className="prose prose-lg prose-orange max-w-none text-gray-900">
      <ReactMarkdown
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ children, className, node: _node, ...props }) => {
            const language = className?.match(/language-([\w+-]+)/)?.[1];
            const code = String(children).replace(/\n$/, '');

            if (language === 'mermaid') return <MermaidDiagram code={code} />;
            if (language) return <StaticCodeBlock language={language} code={code} />;

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

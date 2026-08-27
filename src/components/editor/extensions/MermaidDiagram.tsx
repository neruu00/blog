/**
 * @file MermaidDiagram.tsx
 * @description Mermaid 코드를 SVG로 렌더링하는 클라이언트 컴포넌트.
 *              에디터 미리보기(MermaidComponent)와 읽기 화면(PostContent)이 공유한다.
 *              mermaid는 브라우저 전용이라 서버에서는 스켈레톤만 나가고 마운트 후 그려진다.
 */

'use client';

import mermaid from 'mermaid';
import { useEffect, useState } from 'react';

import Skeleton from '@/components/ui/Skeleton';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose', // 텍스트 렌더링 호환성 향상
});

interface MermaidDiagramProps {
  code: string;
}

export default function MermaidDiagram({ code }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const render = async () => {
      if (!code.trim()) {
        if (isMounted) setSvg('');
        return;
      }
      try {
        // mermaid.render는 같은 ID로 두 번 이상 부르면 다이어그램 타입에 따라
        // 이전 DOM 캐시가 꼬인다. 매번 새 일회용 ID로 렌더링을 강제한다.
        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const result = await mermaid.render(id, code);
        if (isMounted) {
          setSvg(result.svg);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted)
          setError(err instanceof Error ? err.message : 'Syntax Error in Mermaid code');
      }
    };

    render();
    return () => {
      isMounted = false;
    };
  }, [code]);

  return (
    <div className="flex min-h-[150px] w-full items-center justify-center overflow-x-auto">
      {error ? (
        <div className="w-full rounded-lg bg-red-50 p-4 font-mono text-sm whitespace-pre-wrap text-red-500">
          {error}
        </div>
      ) : svg === null ? (
        <Skeleton className="h-[150px] w-full" />
      ) : (
        <div
          className="flex w-full justify-center [&>svg]:h-auto [&>svg]:w-full [&>svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
}

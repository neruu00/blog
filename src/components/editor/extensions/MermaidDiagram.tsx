/**
 * @file MermaidDiagram.tsx
 * @description Mermaid 코드를 SVG로 렌더링하는 클라이언트 컴포넌트. 에디터 미리보기와 읽기 화면에서 함께 쓴다.
 *              mermaid는 브라우저 전용이라 서버에서는 스켈레톤만 내보내고 마운트한 뒤 그린다.
 */

'use client';

import { useEffect, useState } from 'react';

import Skeleton from '@/components/ui/Skeleton';
import { useInViewOnce } from '@/hooks/useInViewOnce';

type MermaidApi = (typeof import('mermaid'))['default'];

/**
 * mermaid는 실제로 그릴 때만 동적으로 불러오고, initialize도 그때 한 번만 실행한다.
 * 정적 import하면 d3·dompurify까지 라우트 번들에 들어가 다이어그램이 없는 글도 그 비용을 치른다.
 */
let mermaidPromise: Promise<MermaidApi> | null = null;

function loadMermaid() {
  mermaidPromise ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose', // 노드 라벨의 HTML 텍스트가 렌더링되도록 허용한다
    });
    return mermaid;
  });
  return mermaidPromise;
}

interface MermaidDiagramProps {
  code: string;
}

export default function MermaidDiagram({ code }: MermaidDiagramProps) {
  // 뷰포트에 가까워졌을 때만 그린다. 로드할 때 모두 그리면 메인 스레드를 점유해 본문 LCP가 늦어진다.
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ rootMargin: '200px 0px' });
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inView) return;

    let isMounted = true;

    const render = async () => {
      if (!code.trim()) {
        if (isMounted) setSvg('');
        return;
      }
      try {
        const mermaid = await loadMermaid();
        if (!isMounted) return;
        // mermaid.render를 같은 ID로 여러 번 호출하면 다이어그램 종류에 따라 이전 DOM 캐시가 꼬인다.
        // 그래서 매번 새 일회용 ID로 렌더링한다.
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
  }, [code, inView]);

  return (
    <div
      ref={ref}
      className="flex min-h-[150px] w-full items-center justify-center overflow-x-auto"
    >
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

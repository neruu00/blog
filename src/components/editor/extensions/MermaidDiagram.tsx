/**
 * @file MermaidDiagram.tsx
 * @description Mermaid 코드를 SVG로 렌더링하는 클라이언트 컴포넌트.
 *              에디터 미리보기(MermaidComponent)와 읽기 화면(PostContent)이 공유한다.
 *              mermaid는 브라우저 전용이라 서버에서는 스켈레톤만 나가고 마운트 후 그려진다.
 */

'use client';

import { useEffect, useState } from 'react';

import Skeleton from '@/components/ui/Skeleton';
import { useInViewOnce } from '@/hooks/useInViewOnce';

type MermaidApi = (typeof import('mermaid'))['default'];

/**
 * mermaid를 정적 import하면 d3·dompurify까지 읽기 페이지의 라우트 번들에 들어간다.
 * 다이어그램이 없는 글도 그걸 내려받아 실행하느라 본문 첫 페인트가 밀렸다 —
 * 실제로 그릴 때만 받아오고, initialize도 그때 한 번만 돈다.
 */
let mermaidPromise: Promise<MermaidApi> | null = null;

function loadMermaid() {
  mermaidPromise ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose', // 텍스트 렌더링 호환성 향상
    });
    return mermaid;
  });
  return mermaidPromise;
}

interface MermaidDiagramProps {
  code: string;
}

export default function MermaidDiagram({ code }: MermaidDiagramProps) {
  // 글 하나에 다이어그램이 여럿이고 대개 첫 화면 밖이다. 전부 로드 시점에 그리면
  // 메인스레드를 붙잡아 본문 LCP를 늦춘다 — 가까워지면 그린다.
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

/**
 * @file useInViewOnce.ts
 * @description 요소가 화면에 처음 들어온 순간을 한 번만 알려주는 훅.
 *              Reveal(등장 애니메이션)과 MermaidDiagram(지연 렌더)이 공유한다.
 *
 *              ID로 "지금 보이는 요소"를 좇는 useIntersectionObserver(TOC용)와는 다르다.
 *              여기는 ref 하나에 대해 "봤는지 여부"만 필요하고, 한 번 true가 되면 되돌아오지 않는다.
 */

import { useEffect, useRef, useState } from 'react';

interface UseInViewOnceOptions {
  /** 진입 판정 여유. 미리 준비시키려면 양수로 (예: '200px 0px') */
  rootMargin?: string;
  /** 배열을 받지 않는다 — 렌더마다 새 배열이 들어오면 옵저버가 매번 재생성된다 */
  threshold?: number;
  /** true면 관찰을 건너뛰고 즉시 보인 것으로 친다 (모션 최소화 설정 등) */
  skip?: boolean;
}

/**
 * @returns `[ref, inView]` — ref를 관찰 대상에 걸면 진입 시 inView가 한 번 true가 된다
 */
export function useInViewOnce<T extends HTMLElement>({
  rootMargin = '0px',
  threshold = 0,
  skip = false,
}: UseInViewOnceOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (skip) {
      setInView(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 한 번만 알린다 — 스크롤을 오르내릴 때마다 다시 발동하면 소비하는 쪽이 깜빡인다
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, skip]);

  return [ref, inView] as const;
}

/**
 * @file useInViewOnce.ts
 * @description 요소가 화면에 처음 들어오는 순간을 한 번만 알려 주는 훅. `Reveal`과 `MermaidDiagram`이 쓴다.
 *              한 번 true가 되면 다시 false로 돌아가지 않는다.
 */

import { useEffect, useRef, useState } from 'react';

interface UseInViewOnceOptions {
  /** 진입 판정 여유. 미리 준비하려면 양수로 준다 (예: '200px 0px') */
  rootMargin?: string;
  /** 숫자 하나만 받는다. 배열은 렌더링할 때마다 새로 만들어져 옵저버가 매번 다시 생성된다 */
  threshold?: number;
  /** true면 관찰하지 않고 바로 보인 것으로 처리한다 (모션 최소화 설정 등) */
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
        // 스크롤할 때마다 다시 알리면 사용하는 쪽이 깜빡이므로 한 번만 알린다
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

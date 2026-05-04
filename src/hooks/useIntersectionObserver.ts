/**
 * @file useIntersectionObserver.ts
 * @description IntersectionObserver를 래핑한 커스텀 훅.
 *              TOC 등에서 현재 화면에 보이는 요소를 감지하는 데 사용한다.
 */

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  /** Observer root margin */
  rootMargin?: string;
  /** Observer threshold */
  threshold?: number | number[];
}

/**
 * 여러 요소를 관찰하여 현재 화면에 보이는 요소의 ID를 반환한다.
 *
 * @param elementIds - 관찰할 요소들의 ID 배열
 * @param options - IntersectionObserver 옵션
 * @returns 현재 화면에 보이는 요소의 ID
 */
export function useIntersectionObserver(
  elementIds: string[],
  options: UseIntersectionObserverOptions = {},
) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (elementIds.length === 0) return;

    const { rootMargin = '0% 0% -80% 0%', threshold = 0 } = options;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin, threshold },
    );

    const tryObserve = () => {
      const elements = elementIds
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];

      if (elements.length > 0) {
        elements.forEach((el) => observerRef.current?.observe(el));
        return true;
      }
      return false;
    };

    let mutationObserver: MutationObserver | null = null;

    if (!tryObserve()) {
      mutationObserver = new MutationObserver(() => {
        if (tryObserve()) {
          mutationObserver?.disconnect();
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      mutationObserver?.disconnect();
      observerRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(elementIds)]);

  return activeId;
}

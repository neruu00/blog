/**
 * @file useIntersectionObserver.ts
 * @description 여러 요소 중 지금 화면에 보이는 요소의 id를 추적하는 훅. 목차의 현재 위치 표시에 쓴다.
 */

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * `elementIds` 요소를 관찰해 화면에 보이는 요소의 id를 반환한다.
 * 요소가 아직 DOM에 없으면 나타날 때까지 기다린 뒤 관찰을 시작한다.
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
      // body 전체 대신 본문(article)의 변화만 지켜본다
      const targetNode = document.querySelector('article') || document.body;
      mutationObserver.observe(targetNode, { childList: true, subtree: true });
    }

    return () => {
      mutationObserver?.disconnect();
      observerRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(elementIds)]);

  return activeId;
}

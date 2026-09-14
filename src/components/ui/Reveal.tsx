/**
 * @file Reveal.tsx
 * @description 스크롤해서 화면에 들어오면 페이드 업으로 나타나는 래퍼.
 *              이 저장소의 유일한 애니메이션 프리미티브 — 새 효과를 만들기 전에 이걸 먼저 본다.
 *
 *              라이브러리를 쓰지 않는다: 필요한 건 "보이면 클래스 하나 붙이기"뿐이라
 *              IntersectionObserver + CSS 트랜지션으로 충분하다.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface RevealProps {
  children: React.ReactNode;
  /** 목록에서 순차 등장시킬 때의 지연(ms). 과하면 느려 보이니 60~80 언저리로 */
  delay?: number;
  className?: string;
}

export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 모션을 끈 사용자에겐 애니메이션 없이 즉시 보여준다
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 한 번만 재생한다 — 스크롤을 오르내릴 때마다 깜빡이면 싸구려로 보인다
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      // JS가 죽으면 opacity-0에 갇혀 본문이 통째로 사라진다 — noscript 스타일이 이 속성을 잡는다
      data-reveal
      style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        'motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out',
        // motion-reduce에서는 아래 두 클래스가 무시되도록 motion-safe로 감싼다
        shown ? 'opacity-100' : 'motion-safe:translate-y-3 motion-safe:opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

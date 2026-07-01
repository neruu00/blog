'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

export default function InteractivePoster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const holoRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cardRef.current || !holoRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 중심 기준 (-0.5 ~ 0.5)
    const centerX = x / rect.width - 0.5;
    const centerY = y / rect.height - 0.5;

    // 마우스가 있는 쪽이 튀어나오도록 설정 (최대 15도)
    const rotateX = -centerY * 30; // 위로 갈수록 튀어나오게 (음수 y -> 양수 rotateX)
    const rotateY = centerX * 30; // 오른쪽으로 갈수록 튀어나오게 (양수 x -> 양수 rotateY)

    const posX = (x / rect.width) * 100;
    const posY = (y / rect.height) * 100;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
      if (holoRef.current) {
        holoRef.current.style.backgroundPosition = `${posX}% ${posY}%`;
      }
    });
  }, []);

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
      }
      if (holoRef.current) {
        holoRef.current.style.backgroundPosition = `50% 50%`;
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="group relative h-64 cursor-pointer transition-transform duration-200 ease-out"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="relative h-full w-full overflow-hidden transition-all duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(0deg) rotateY(0deg)',
        }}
      >
        <Image
          src="/poster1.jpg"
          alt="Poster"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 20vw"
        />

        {/* Holofoil Rare Effect */}
        <div
          ref={holoRef}
          className="absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `linear-gradient(
              115deg,
              transparent 20%,
              rgba(255, 0, 132, 0.5) 30%,
              rgba(255, 165, 0, 0.5) 40%,
              rgba(255, 255, 0, 0.5) 50%,
              rgba(0, 128, 0, 0.5) 60%,
              rgba(0, 0, 255, 0.5) 70%,
              rgba(75, 0, 130, 0.5) 80%,
              transparent 90%
            )`,
            backgroundSize: '300% 300%',
            backgroundPosition: `50% 50%`,
            mixBlendMode: 'color-dodge',
          }}
        />
      </div>
    </div>
  );
}

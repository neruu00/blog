'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function InteractivePoster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 }); // 퍼센트
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 중심 기준 (-0.5 ~ 0.5)
    const centerX = x / rect.width - 0.5;
    const centerY = y / rect.height - 0.5;

    // 마우스가 있는 쪽이 튀어나오도록 설정 (최대 15도)
    const rotateX = -centerY * 30; // 위로 갈수록 튀어나오게 (음수 y -> 양수 rotateX)
    const rotateY = centerX * 30; // 오른쪽으로 갈수록 튀어나오게 (양수 x -> 양수 rotateY)

    setRotation({ x: rotateX, y: rotateY });

    // 마우스 위치 (퍼센트)
    setMousePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const onMouseEnter = () => setIsHovered(true);
    const onMouseLeave = () => {
      setIsHovered(false);
      setRotation({ x: 0, y: 0 });
      setMousePos({ x: 50, y: 50 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('mouseleave', onMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', onMouseEnter);
      element.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className="relative h-64 cursor-pointer transition-transform duration-200 ease-out"
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden transition-all duration-200 ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
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
          className={`absolute inset-0 z-10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
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
            backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
            mixBlendMode: 'color-dodge',
          }}
        />
      </div>
    </div>
  );
}

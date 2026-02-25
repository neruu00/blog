'use client';

import { useEffect, useRef, useState } from 'react';

// 크기가 커진 만큼 파티클 설정도 크게 변경
class NoteParticle {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  life: number;
  char: string;
  size: number;

  constructor(startX: number, startY: number) {
    this.x = startX + (Math.random() * 40 - 20);
    this.y = startY;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * -3 - 1.5; // 위로 빠르게 올라감
    this.life = 1;
    this.size = Math.random() * 20 + 20; // 20px ~ 40px

    const chars = ['♪', '♫', '♬'];
    this.char = chars[Math.floor(Math.random() * chars.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 0.012;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(249, 115, 22, ${this.life})`;
    ctx.font = `${this.size}px sans-serif`;
    ctx.fillText(this.char, this.x, this.y);
  }
}

export default function TurntablePlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isPlayingRef = useRef(isPlaying);
  const rotationRef = useRef(0);
  const notesRef = useRef<NoteParticle[]>([]);
  const animationRef = useRef<number | null>(null);

  // 톤암의 현재 각도를 저장하는 Ref (부드러운 전환을 위해 사용)
  const tonearmAngleRef = useRef(-0.25);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 사이드바 너비에 맞게 캔버스 내부 해상도를 크게 키웁니다 (400x400)
    const CANVAS_SIZE = 400;
    const centerX = 200;
    const centerY = 200;

    const drawTurntable = () => {
      // 1. 거대해진 레코드판
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);

      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.fillStyle = '#171717';
      ctx.fill();

      // 2. 홈 (Grooves)
      ctx.strokeStyle = '#262626';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 1.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 120, Math.PI * 0.5, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 145, Math.PI * 1.2, Math.PI * 0.8);
      ctx.stroke();

      // 3. 중앙 라벨 및 마커
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(30, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();

      // 4. 톤암 (바늘) - 목표 각도를 향해 부드럽게 이동(Lerp)
      const targetTonearmAngle = isPlayingRef.current ? 0.35 : -0.25;
      // 현재 각도 = 현재 각도 + (목표 각도 - 현재 각도) * 속도
      tonearmAngleRef.current += (targetTonearmAngle - tonearmAngleRef.current) * 0.05;

      ctx.save();
      // 톤암의 기준점을 캔버스 우측 상단 쯤으로 배치
      ctx.translate(centerX + 130, centerY - 130);
      ctx.rotate(tonearmAngleRef.current);

      // 암대
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-60, 150);
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#a3a3a3';
      ctx.stroke();

      // 헤드 쉘 (바늘 끝부분)
      ctx.translate(-60, 150);
      ctx.rotate(0.2); // 약간 기울임
      ctx.fillStyle = '#404040';
      ctx.fillRect(-8, -10, 16, 30);
      ctx.restore();

      // 톤암 축(Base) 덮개
      ctx.save();
      ctx.translate(centerX + 130, centerY - 130);
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#3b3b3b';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#171717';
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      if (isPlayingRef.current) {
        rotationRef.current += 0.02; // 회전 속도
        if (Math.random() < 0.1) {
          notesRef.current.push(new NoteParticle(centerX, centerY));
        }
      }

      drawTurntable();

      notesRef.current = notesRef.current.filter((note) => note.life > 0);
      notesRef.current.forEach((note) => {
        note.update();
        note.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    // 개발자 정보 카드와 완벽히 동일한 스타일의 컨테이너
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 flex flex-col items-center">
      {/* Scroll Velocity를 위한 CSS 캡슐화 */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>

      {/* 턴테이블 캔버스 버튼 */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-full aspect-square relative flex items-center justify-center rounded-full hover:scale-[1.02] transition-transform focus:outline-none"
        title="클릭하여 재생/정지"
      >
        <canvas ref={canvasRef} width={400} height={400} className="w-full h-full block" />
      </button>

      {/* Scroll Velocity (Marquee) 곡 정보 영역 */}
      <div className="w-full overflow-hidden mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800">
        {/* 너비를 200%로 설정하고 50%만큼 무한 이동하여 자연스럽게 이어지게 만듭니다 */}
        <div className="flex w-[200%] animate-marquee">
          <span className="w-1/2 text-sm text-gray-600 dark:text-neutral-400 font-mono tracking-wide">
            🎵 NOW PLAYING: Lofi Study Beats - Chillhop Music &nbsp;
          </span>
          <span className="w-1/2 text-sm text-gray-600 dark:text-neutral-400 font-mono tracking-wide">
            🎵 NOW PLAYING: Lofi Study Beats - Chillhop Music &nbsp;
          </span>
        </div>
      </div>
    </div>
  );
}

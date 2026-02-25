'use client';

import useMusic from '@/hooks/useMusic';
import { useEffect, useRef } from 'react';

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
    this.speedY = Math.random() * -3 - 1.5;
    this.life = 1;
    this.size = Math.random() * 20 + 20;

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
  // 1. 내부 useState 대신 useMusic 훅의 상태와 제어 함수를 가져옵니다.
  const { isPlaying, toggleMusic } = useMusic();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // requestAnimationFrame 내부에서 최신 isPlaying 값을 참조하기 위한 Ref
  const isPlayingRef = useRef(isPlaying);
  const rotationRef = useRef(0);
  const notesRef = useRef<NoteParticle[]>([]);
  const animationRef = useRef<number | null>(null);
  const tonearmAngleRef = useRef(-0.25);

  // 2. 훅에서 받아온 isPlaying 상태가 변할 때마다 Ref를 동기화합니다.
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CANVAS_SIZE = 400;
    const centerX = 200;
    const centerY = 200;

    const drawTurntable = () => {
      // 레코드판
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);

      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.fillStyle = '#171717';
      ctx.fill();

      // 홈 (Grooves)
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

      // 라벨 및 마커
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

      // 톤암 애니메이션
      const targetTonearmAngle = isPlayingRef.current ? 0.35 : -0.25;
      tonearmAngleRef.current += (targetTonearmAngle - tonearmAngleRef.current) * 0.05;

      ctx.save();
      ctx.translate(centerX + 130, centerY - 130);
      ctx.rotate(tonearmAngleRef.current);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-60, 150);
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#a3a3a3';
      ctx.stroke();

      ctx.translate(-60, 150);
      ctx.rotate(0.2);
      ctx.fillStyle = '#404040';
      ctx.fillRect(-8, -10, 16, 30);
      ctx.restore();

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
        rotationRef.current += 0.02;
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
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 flex flex-col items-center">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>

      {/* 3. onClick 이벤트에 useMusic 훅의 toggleMusic 함수를 연결합니다. */}
      <button
        onClick={toggleMusic}
        className="w-full aspect-square relative flex items-center justify-center rounded-full hover:scale-[1.02] transition-transform focus:outline-none"
        title={isPlaying ? '음악 정지' : '음악 재생'}
      >
        <canvas ref={canvasRef} width={400} height={400} className="w-full h-full block" />
      </button>

      {/* 곡 정보 UI 업데이트 */}
      <div className="w-full overflow-hidden mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800">
        <div className="flex w-[200%] animate-marquee">
          <span className="w-1/2 text-sm text-gray-600 dark:text-neutral-400 font-mono tracking-wide">
            🎵 NOW PLAYING: Generative Lofi Beats (Web Audio API) &nbsp;
          </span>
          <span className="w-1/2 text-sm text-gray-600 dark:text-neutral-400 font-mono tracking-wide">
            🎵 NOW PLAYING: Generative Lofi Beats (Web Audio API) &nbsp;
          </span>
        </div>
      </div>
    </div>
  );
}

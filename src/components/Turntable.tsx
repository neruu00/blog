'use client';

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

interface TurntableProps {
  isPlaying: boolean;
  toggleMusic: () => void;
  size?: number;
  className?: string;
}

export default function Turntable({
  isPlaying,
  toggleMusic,
  size,
  className = '',
}: TurntableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isPlayingRef = useRef(isPlaying);
  const rotationRef = useRef(0);
  const notesRef = useRef<NoteParticle[]>([]);
  const animationRef = useRef<number | null>(null);
  const tonearmAngleRef = useRef(-0.25);

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
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.fillStyle = '#171717';
      ctx.fill();

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
        if (Math.random() < 0.1) notesRef.current.push(new NoteParticle(centerX, centerY));
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
    <button
      onClick={toggleMusic}
      style={size ? { width: size, height: size } : {}}
      className={`relative mx-auto flex shrink-0 items-center justify-center rounded-full transition-transform hover:scale-[1.02] focus:outline-none ${className}`}
      title={isPlaying ? '음악 정지' : '음악 재생'}
    >
      <canvas ref={canvasRef} width={400} height={400} className="block h-full w-full" />
    </button>
  );
}

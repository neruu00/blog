'use client';

import { useEffect, useRef } from 'react';

export default function ConfettiParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];

    // 무지개색 7가지 정의 (UI에 잘 어울리는 채도 높은 색상)
    const colors = [
      '#ef4444', // 빨강 (Red)
      '#f97316', // 주황 (Orange)
      '#eab308', // 노랑 (Yellow)
      '#22c55e', // 초록 (Green)
      '#3b82f6', // 파랑 (Blue)
      '#6366f1', // 남색 (Indigo)
      '#a855f7', // 보라 (Violet)
    ];

    // 파티클 50개 생성
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: canvas.width / 2, // 화면 중앙에서 시작
        y: canvas.height * 0.6, // 살짝 아래쪽에서 폭발
        w: Math.random() * 10 + 5, // 너비
        h: Math.random() * 10 + 5, // 높이
        vx: Math.random() * 20 - 10, // 좌우 퍼짐 속도
        vy: Math.random() * -15 - 5, // 위로 솟구치는 속도
        rot: Math.random() * 360, // 초기 회전각
        rotSpeed: Math.random() * 10 - 5, // 회전 속도
        // 7가지 무지개 색상 중 하나를 랜덤으로 부여
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.vy += 0.4; // 중력 (아래로 당기는 힘)
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    // 창 크기 변경 시 캔버스 크기 업데이트 (반응형 대응)
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 컴포넌트 언마운트 시 정리
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50" />;
}

import { useRef, useState, useEffect, useCallback } from 'react';

// 음악 데이터와 상수는 훅 외부로 빼서 불필요한 재선언을 방지합니다.
const BEAT = 0.4;
const CHORDS = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [293.66, 349.23, 440.0, 523.25], // Dm7
  [196.0, 246.94, 293.66, 349.23], // G7
];
const BASS_PROGRESSION = [
  [130.81, 164.81, 196.0, 164.81],
  [110.0, 130.81, 164.81, 130.81],
  [146.83, 174.61, 220.0, 174.61],
  [98.0, 123.47, 146.83, 123.47],
];
const MELODY_SCALE = [523.25, 587.33, 622.25, 659.25, 698.46, 783.99, 932.33, 1046.5];

export default function useMusic() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextLoopTime = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 소리 발생 헬퍼 함수
  const playTone = useCallback(
    (
      ctx: AudioContext,
      freq: number,
      type: OscillatorType,
      time: number,
      duration: number,
      volume: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.stop(time + duration);
    },
    [],
  );

  // 딱 1루프(16박자)만 스케줄링하는 함수
  const scheduleLoop = useCallback(
    (ctx: AudioContext, startTime: number) => {
      for (let i = 0; i < 4; i++) {
        const measureStart = startTime + i * 4 * BEAT;

        // 1. 화음 (엇박)
        CHORDS[i].forEach((f) =>
          playTone(ctx, f, 'triangle', measureStart + BEAT * 0.5, BEAT * 1.5, 0.06),
        );
        CHORDS[i].forEach((f) =>
          playTone(ctx, f, 'triangle', measureStart + BEAT * 2.5, BEAT * 1.5, 0.06),
        );

        // 2. 워킹 베이스 (정박)
        for (let b = 0; b < 4; b++) {
          playTone(ctx, BASS_PROGRESSION[i][b], 'sine', measureStart + b * BEAT, BEAT * 0.9, 0.4);
        }

        // 3. 제너레이티브 멜로디
        for (let m = 0; m < 4; m++) {
          if (Math.random() > 0.4) {
            const randomFreq = MELODY_SCALE[Math.floor(Math.random() * MELODY_SCALE.length)];
            const isSyncopated = Math.random() > 0.5;
            const timeOffset = isSyncopated ? m * BEAT + BEAT / 2 : m * BEAT;
            playTone(ctx, randomFreq, 'square', measureStart + timeOffset, BEAT * 0.4, 0.04);
          }
        }
      }
    },
    [playTone],
  );

  // 무한 반복을 관리하는 스케줄러 (버퍼링 역할)
  const scheduler = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    // 현재 재생 시간보다 10초 앞까지만 미리 악보를 그림 (10초 버퍼)
    while (nextLoopTime.current < ctx.currentTime + 10.0) {
      scheduleLoop(ctx, nextLoopTime.current);
      nextLoopTime.current += 16 * BEAT; // 다음 루프 시작 시간을 16박자 뒤로 밀어줌
    }
  }, [scheduleLoop]);

  const stopMusic = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playMusic = useCallback(() => {
    if (isPlaying) return;

    // 오디오 컨텍스트 초기화
    const CtxClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new CtxClass();
    audioCtxRef.current = ctx;

    // 첫 루프 시작 시간을 현재 시간의 0.1초 뒤로 설정
    nextLoopTime.current = ctx.currentTime + 0.1;
    setIsPlaying(true);

    // 즉시 첫 번째 스케줄링 실행
    scheduler();
    // 1초마다 체크하여 미리 스케줄링 채워넣기
    timerRef.current = setInterval(scheduler, 1000);
  }, [isPlaying, scheduler]);

  const toggleMusic = useCallback(() => {
    if (isPlaying) stopMusic();
    else playMusic();
  }, [isPlaying, playMusic, stopMusic]);

  // 컴포넌트가 언마운트될 때 메모리 누수 방지
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, [stopMusic]);

  return { isPlaying, toggleMusic, playMusic, stopMusic };
}

'use client';

import useMusic from '@/hooks/useMusic';
import Turntable from './Turntable';

interface MusicPlayerProps {
  className?: string;
  size?: number;
}

export default function MusicPlayer({ className = '', size = 180 }: MusicPlayerProps) {
  const { isPlaying, toggleMusic } = useMusic();

  return (
    <div
      className={`bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 transition-all flex flex-col items-center justify-center p-6 ${className}`}
    >
      <Turntable isPlaying={isPlaying} toggleMusic={toggleMusic} size={size} />
    </div>
  );
}

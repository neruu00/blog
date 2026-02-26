'use client';

import { useGlobalMusic } from '@/contexts/MusicProvider';
import Turntable from './Turntable';

interface MusicPlayerProps {
  className?: string;
  size?: number;
}

export default function MusicPlayer({ className = '', size = 180 }: MusicPlayerProps) {
  const { isPlaying, toggleMusic } = useGlobalMusic();

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      <Turntable isPlaying={isPlaying} toggleMusic={toggleMusic} size={size} />
    </div>
  );
}

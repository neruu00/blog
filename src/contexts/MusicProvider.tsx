'use client';

import { createContext, useContext, ReactNode } from 'react';

import useMusic from '@/hooks/useMusic';

type MusicContextType = ReturnType<typeof useMusic>;

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const musicState = useMusic();

  return <MusicContext.Provider value={musicState}>{children}</MusicContext.Provider>;
}

export function useGlobalMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useGlobalMusic은 MusicProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}

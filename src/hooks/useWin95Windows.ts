/**
 * @file useWin95Windows.ts
 * @description /portfolio 바탕화면의 창 열기·닫기·앞으로 가져오기. Win95WindowManager 안에서만 쓸 수 있다.
 *              창 id는 실제 경로가 아니라 가상 경로다(about, project, project/<slug>).
 */

import { createContext, useContext } from 'react';

export interface Win95WindowActions {
  /** 닫혀 있으면 새로 열고, 열려 있으면 맨 앞으로 가져온다 */
  open: (id: string) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
}

export const Win95WindowsContext = createContext<Win95WindowActions | null>(null);

export function useWin95Windows() {
  const actions = useContext(Win95WindowsContext);
  if (!actions) throw new Error('useWin95Windows는 Win95WindowManager 안에서만 쓸 수 있습니다.');
  return actions;
}

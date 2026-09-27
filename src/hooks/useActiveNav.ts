'use client';

/**
 * @file useActiveNav.ts
 * @description 네비 항목이 현재 경로에 해당하는지 판별하는 함수를 반환한다. 홈(`/`)은 정확히 일치할 때만 활성화된다.
 */

import { usePathname } from 'next/navigation';

export function useActiveNav() {
  const pathname = usePathname();
  return (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
}

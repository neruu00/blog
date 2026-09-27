'use client';

/**
 * @file AuthProvider.tsx
 * @description 클라이언트 컴포넌트에서 `useSession`을 쓸 수 있게 하는 NextAuth 세션 프로바이더.
 */

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

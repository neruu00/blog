/**
 * @file next-auth.d.ts
 * @description NextAuth 세션·JWT 타입에 사용자 id와 관리자 여부를 추가한다.
 */

import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}

/**
 * @file auth.ts
 * @description NextAuth 설정(Google OAuth + Supabase Adapter)과 관리자 판별 헬퍼.
 */

import { SupabaseAdapter } from '@auth/supabase-adapter';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import type { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  }) as Adapter, // next-auth v4와 @auth/supabase-adapter 간 타입 시그니처 차이 보정
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id || token.sub,
        isAdmin: !!process.env.ADMIN_EMAIL && session.user?.email === process.env.ADMIN_EMAIL,
      },
    }),
  },
};

/** 로그인한 사용자의 이메일이 `ADMIN_EMAIL`과 같으면 관리자로 본다. */
export async function isAdmin(): Promise<boolean> {
  // ADMIN_EMAIL이 없으면 undefined === undefined가 되어 비로그인 방문자까지 관리자로 통과하므로 막는다
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  const session = await getServerSession(authOptions);
  return session?.user?.email === adminEmail;
}

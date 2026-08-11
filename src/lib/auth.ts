/**
 * @file auth.ts
 * @description NextAuth.js 설정 및 인증 관련 헬퍼 함수.
 *              Google OAuth와 Supabase Adapter를 사용한다.
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

/**
 * 현재 세션 유저가 관리자(admin)인지 확인
 * 관리자 기준: 로그인한 유저의 이메일이 환경변수 ADMIN_EMAIL과 일치하는지 판별
 */
export async function isAdmin(): Promise<boolean> {
  // fail-closed: ADMIN_EMAIL 미설정 시 undefined === undefined 로
  // 비로그인 방문자까지 admin 이 되는 것을 방지한다.
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  const session = await getServerSession(authOptions);
  return session?.user?.email === adminEmail;
}

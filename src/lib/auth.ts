/**
 * @file auth.ts
 * @description NextAuth.js 설정 및 인증 관련 헬퍼 함수.
 *              Google OAuth와 Supabase Adapter를 사용한다.
 */

import { SupabaseAdapter } from '@auth/supabase-adapter';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import type { NextAuthOptions } from 'next-auth';

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
  }) as any, // next-auth v4와 @auth/supabase-adapter 호환성
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
        isAdmin: session.user?.email === process.env.ADMIN_EMAIL,
      },
    }),
  },
};

/**
 * 현재 세션 유저가 관리자(admin)인지 확인
 * 관리자 기준: 로그인한 유저의 이메일이 환경변수 ADMIN_EMAIL과 일치하는지 판별
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

/**
 * 관리자 권한 필수 확인
 * 관리자가 아니면 Error 발생
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error('권한이 없습니다.');
  }
}

/**
 * 로그인 여부 필수 확인
 * 로그인이 되어있지 않으면 Error 발생
 */
export async function requireAuth(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('로그인이 필요합니다.');
  }
}

/**
 * [호환성 유지] 기존 코드에서 사용하던 verifyAdminSession 대체
 */
export async function verifyAdminSession(): Promise<boolean> {
  return isAdmin();
}

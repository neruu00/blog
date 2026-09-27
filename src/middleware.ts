/**
 * @file middleware.ts
 * @description /write, /edit 경로는 관리자만 접근할 수 있게 막는다. 서버 액션 호출은 막지 못하므로
 *              액션마다 권한을 따로 검사해야 한다.
 */

import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    // fail-closed: ADMIN_EMAIL이 없으면 아무도 통과하지 못한다. isAdmin()과 같은 기준이다.
    const isAdmin = !!process.env.ADMIN_EMAIL && token?.email === process.env.ADMIN_EMAIL;

    if (!isAdmin) {
      // 이미 로그인한 상태라 로그인 페이지로 보내면 리다이렉트 루프가 생길 수 있어 홈으로 보낸다.
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      // 로그인 여부만 확인한다. false면 로그인 페이지로 보내고, true면 위 middleware에서 관리자 여부를 검사한다.
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ['/write/:path*', '/edit/:path*'],
};

import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.email === process.env.ADMIN_EMAIL;

    // 관리자 권한이 필요한 경로에 접근했지만 관리자가 아닌 경우
    if (!isAdmin) {
      // 홈으로 리다이렉트 (로그인은 되어 있으므로 signin으로 보내면 루프 발생 가능)
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      /**
       * @description 일차적으로 로그인 여부만 확인
       * true를 반환하면 위 middleware 함수가 실행됨
       * false를 반환하면 자동으로 로그인 페이지로 리다이렉트됨
       */
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ['/write/:path*', '/edit/:path*'],
};

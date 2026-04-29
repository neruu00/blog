/**
 * @file layout.tsx
 * @description (blog) 라우트 그룹 레이아웃.
 *              데스크톱에서 SideNav를 좌측에 고정 배치하고,
 *              모바일에서는 MobileHeader를 상단에 표시한다.
 *              Main 콘텐츠는 max-w-3xl (768px)로 중앙 정렬.
 */

import Footer from '@/components/layout/Footer';
import MobileHeader from '@/components/layout/MobileHeader';
import SideNav from '@/components/layout/SideNav';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 데스크톱 사이드 네비게이션 (lg 이상에서만 표시) */}
      <SideNav />

      {/* 모바일 상단 헤더 (lg 미만에서만 표시) */}
      <MobileHeader />

      {/* 메인 콘텐츠 영역 */}
      <div className="min-h-screen lg:pl-64">
        {/* 모바일 헤더 높이만큼 상단 패딩 */}
        <div className="pt-14 lg:pt-0">
          {/* 넓은 상단 여백 — y축으로 시원한 느낌 */}
          <div className="pt-16 lg:pt-24" />

          <main className="mx-auto max-w-6xl px-6 pb-16">{children}</main>

          <Footer />
        </div>
      </div>
    </>
  );
}

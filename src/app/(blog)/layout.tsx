/**
 * @file layout.tsx
 * @description (blog) 라우트 그룹 레이아웃. lg 이상에서는 SideNav를 왼쪽에 고정하고,
 *              lg 미만에서는 MobileHeader를 상단에 띄운다.
 */

import FloatingActionButton from '@/components/layout/FloatingActionButton';
import Footer from '@/components/layout/Footer';
import MobileHeader from '@/components/layout/MobileHeader';
import SideNav from '@/components/layout/SideNav';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SideNav />

      <MobileHeader />

      <FloatingActionButton />

      <div className="lg:pl-sidenav min-h-screen">
        {/* 고정된 MobileHeader 높이만큼 내린다 */}
        <div className="pt-header lg:pt-0">
          <div className="pt-page-top" />

          {/* 본문 폭은 모든 블로그 페이지가 여기서 공유한다. 페이지에서 따로 max-w를 걸지 않는다 */}
          <main className="px-gutter pb-16">
            <div className="max-w-content mx-auto">{children}</div>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}

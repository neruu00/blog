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

      <div className="min-h-screen lg:pl-64">
        {/* 고정된 MobileHeader 높이만큼 내린다 */}
        <div className="pt-14 lg:pt-0">
          <div className="pt-16 lg:pt-24" />

          <main className="mx-auto max-w-6xl px-6 pb-16">{children}</main>

          <Footer />
        </div>
      </div>
    </>
  );
}

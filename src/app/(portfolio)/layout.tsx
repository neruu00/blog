/**
 * @file layout.tsx
 * @description (portfolio) 라우트 그룹 레이아웃. 블로그의 SideNav 대신 Windows 95 바탕화면·아이콘·작업 표시줄을 깐다.
 *              창은 각 페이지가 그리므로 주소마다 창이 하나씩 열린다. 들어올 때 한 번 부팅 화면을 보여준다.
 */

import Win95Boot from '@/components/project/Win95Boot';
import Win95Desktop from '@/components/project/Win95Desktop';
import Win95Taskbar from '@/components/project/Win95Taskbar';

/** 픽셀 폰트는 이 화면에서만 쓰므로 전역 CSS가 아니라 여기서 불러온다 */
const GALMURI_CSS = 'https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css';

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-win-desktop relative min-h-screen pb-14">
      <link rel="stylesheet" href={GALMURI_CSS} precedence="default" />
      {/* JS가 꺼져 있으면 부팅 화면이 걷히지 않고 Reveal이 opacity-0에 머무르므로 둘 다 되돌린다 */}
      <noscript>
        <style>{`[data-reveal]{opacity:1 !important;transform:none !important}[data-win-boot]{display:none !important}`}</style>
      </noscript>

      <Win95Boot />
      <Win95Desktop />

      {/* 바탕화면 아이콘을 덮는 빈 영역이 클릭을 가로채지 않도록 창에만 포인터 이벤트를 준다 */}
      <main className="pointer-events-none relative mx-auto max-w-6xl px-2 pt-2 *:pointer-events-auto sm:px-6 sm:pt-8 lg:pl-36">
        {children}
      </main>

      <Win95Taskbar />
    </div>
  );
}

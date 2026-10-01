/**
 * @file layout.tsx
 * @description (portfolio) 라우트 그룹 레이아웃. 블로그의 SideNav 대신 Windows 95 바탕화면을 깔고,
 *              들어올 때 한 번 부팅 화면을 보여준다. 화면 크기는 뷰포트로 고정해 문서가 스크롤되지 않게 한다.
 */

import Win95Boot from '@/components/project/Win95Boot';

/** 픽셀 폰트는 이 화면에서만 쓰므로 전역 CSS가 아니라 여기서 불러온다 */
const GALMURI_CSS = 'https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css';

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-win-desktop fixed inset-0 overflow-hidden">
      <link rel="stylesheet" href={GALMURI_CSS} precedence="default" />
      {/* JS가 꺼져 있으면 부팅 화면이 걷히지 않으므로 숨긴다 */}
      <noscript>
        <style>{`[data-win-boot]{display:none !important}`}</style>
      </noscript>

      <Win95Boot />
      <main>{children}</main>
    </div>
  );
}

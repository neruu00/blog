/**
 * @file layout.tsx
 * @description /projects 목록과 상세가 함께 쓰는 레이아웃.
 */

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Reveal은 화면에 들어오기 전까지 opacity-0이라, JS가 꺼져 있으면 보이도록 되돌린다 */}
      <noscript>
        <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      {children}
    </>
  );
}

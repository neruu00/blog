/**
 * @file layout.tsx
 * @description (protected) 라우트 그룹 레이아웃. 작성·수정 화면은 SideNav·Footer 없이 페이지만 렌더링한다.
 */

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

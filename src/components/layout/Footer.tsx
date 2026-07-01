/**
 * @file Footer.tsx
 * @description 블로그 하단 푸터 컴포넌트.
 *              저작권 정보와 소셜 링크를 표시한다.
 */

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6">
        {/* 저작권 */}
        <p className="text-xs text-gray-300">© 2026 neruu00. All rights reserved.</p>
      </div>
    </footer>
  );
}

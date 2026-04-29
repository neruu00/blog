/**
 * @file Footer.tsx
 * @description 블로그 하단 푸터 컴포넌트.
 *              저작권 정보와 소셜 링크를 표시한다.
 */

import { Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6">
        {/* 소셜 링크 */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/neruu00"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="mailto:dnwogus4260@naver.com"
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>

        {/* 저작권 */}
        <p className="text-xs text-gray-300">© 2026 neruu00. All rights reserved.</p>
      </div>
    </footer>
  );
}

import { Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

import Tooltip from '@/components/ui/Tooltip';

export default function BlogOwnerProfile() {
  return (
    <div className="flex flex-col items-center">
      {/* 이름 및 직업 */}
      <h2 className="text-lg font-bold text-gray-900">neruu00</h2>
      <p className="mt-1 text-xs text-gray-400">Developer</p>

      {/* 소셜 링크 */}
      <div className="mt-5 flex items-center gap-3">
        <Tooltip text="GitHub" position="top">
          <Link
            href="https://github.com/neruu00"
            target="_blank"
            rel="noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
        </Tooltip>

        <Tooltip text="Email" position="top">
          <Link
            href="mailto:dnwogus4260@naver.com"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </Link>
        </Tooltip>

        <Tooltip text="LinkedIn" position="top">
          <button
            type="button"
            className="flex h-8 w-8 cursor-default items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

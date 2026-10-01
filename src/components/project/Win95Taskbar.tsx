/**
 * @file Win95Taskbar.tsx
 * @description /portfolio 화면 아래에 고정되는 Windows 95 작업 표시줄.
 *              맨 왼쪽 버튼이 시작 버튼 자리에서 블로그 홈(/)으로 돌아가는 출구 역할을 한다.
 */

import { Github, Mail } from 'lucide-react';

import Win95Button from '@/components/project/Win95Button';
import { FolderIcon } from '@/components/project/Win95Icons';
import Win95TaskButton from '@/components/project/Win95TaskButton';
import { PROFILE, PROJECTS } from '@/lib/constants/portfolio';

const projectNames = Object.fromEntries(
  PROJECTS.map(({ slug, name, nameEn }) => [slug, { name, nameEn }]),
);

export default function Win95Taskbar() {
  return (
    <div className="win-raised font-win fixed inset-x-0 bottom-0 z-40 flex h-10 items-center gap-1.5 px-1 text-xs text-black">
      <Win95Button href="/" aria-label="블로그로 돌아가기" className="h-8 px-2 font-bold">
        <FolderIcon size={16} />
        블로그
      </Win95Button>

      <span
        aria-hidden
        className="border-l-win-shadow mx-0.5 h-7 border-r border-l border-r-white"
      />

      <Win95TaskButton projectNames={projectNames} />

      <span className="flex-1" />

      <div className="win-sunken flex h-8 items-center gap-1 px-1.5">
        <a
          href={PROFILE.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          title="GitHub"
          className="p-1"
        >
          <Github className="h-4 w-4" />
        </a>
        <a href={`mailto:${PROFILE.email}`} aria-label="이메일" title="이메일" className="p-1">
          <Mail className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

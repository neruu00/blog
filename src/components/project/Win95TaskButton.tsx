/**
 * @file Win95TaskButton.tsx
 * @description 작업 표시줄에서 지금 열린 창을 나타내는 눌린 버튼. 바탕화면만 보일 때는 그리지 않는다.
 */

'use client';

import { usePathname } from 'next/navigation';

import { FolderIcon, ProfileAppIcon, ProjectAppGlyph } from '@/components/project/Win95Icons';

interface Win95TaskButtonProps {
  /** slug → 프로젝트 이름. portfolio.ts 전체를 클라이언트로 보내지 않으려고 이름만 받는다 */
  projectNames: Record<string, { name: string; nameEn: string }>;
}

function currentTask(pathname: string, projectNames: Win95TaskButtonProps['projectNames']) {
  if (pathname === '/portfolio/about')
    return { icon: <ProfileAppIcon size={16} />, label: 'about' };
  if (pathname === '/portfolio/project')
    return { icon: <FolderIcon size={16} />, label: 'project' };

  const slug = pathname.match(/^\/portfolio\/project\/([^/]+)$/)?.[1];
  const project = slug ? projectNames[slug] : undefined;
  if (project) {
    return {
      icon: <ProjectAppGlyph size={16} letter={project.nameEn.charAt(0)} />,
      label: project.name,
    };
  }
  return null;
}

export default function Win95TaskButton({ projectNames }: Win95TaskButtonProps) {
  const task = currentTask(usePathname(), projectNames);
  if (!task) return null;

  return (
    <span className="win-pressed flex h-8 min-w-0 items-center gap-1.5 px-2 font-bold sm:w-48">
      {task.icon}
      <span className="truncate">{task.label}</span>
    </span>
  );
}

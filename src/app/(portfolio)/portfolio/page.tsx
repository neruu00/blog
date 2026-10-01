/**
 * @file page.tsx
 * @description 포트폴리오 바탕화면. 포트폴리오에서 실제 경로는 이것 하나이고, 창은 Win95WindowManager가
 *              가상 경로로 연다. 창 내용은 여기서 서버 렌더링해 넘기며, 열린 창의 내용만 화면에 그린다.
 *              DB를 거치지 않고 lib/constants/portfolio.ts만 참조해 정적으로 렌더링한다.
 */

import DoomFrame from '@/components/project/DoomFrame';
import PortfolioAbout from '@/components/project/PortfolioAbout';
import ProjectAppGrid from '@/components/project/ProjectAppGrid';
import ProjectDetail from '@/components/project/ProjectDetail';
import {
  DoomAppIcon,
  FolderIcon,
  ProfileAppIcon,
  ProjectAppGlyph,
} from '@/components/project/Win95Icons';
import Win95WindowManager from '@/components/project/Win95WindowManager';
import type { Win95DesktopIconDef, Win95WindowDef } from '@/components/project/Win95WindowManager';
import { PROFILE, PROJECTS } from '@/lib/constants/portfolio';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: PROFILE.summary,
  openGraph: {
    title: `${PROFILE.name} · ${PROFILE.title}`,
    description: PROFILE.summary,
  },
};

const apps = PROJECTS.map(({ slug, name, nameEn, period, claim, cover }) => ({
  slug,
  name,
  nameEn,
  period,
  claim,
  cover,
}));

const desktopIcons: Win95DesktopIconDef[] = [
  { id: 'about', label: 'about', icon: <ProfileAppIcon size={48} /> },
  { id: 'project', label: 'project', icon: <FolderIcon size={48} /> },
  { id: 'doom', label: 'DOOM', icon: <DoomAppIcon size={48} /> },
];

const windows: Win95WindowDef[] = [
  {
    id: 'about',
    title: 'about',
    icon: <ProfileAppIcon size={16} />,
    width: 720,
    height: 600,
    content: <PortfolioAbout />,
  },
  {
    id: 'project',
    title: 'project',
    icon: <FolderIcon size={16} />,
    showAddress: true,
    status: `개체 ${PROJECTS.length}개`,
    width: 640,
    height: 320,
    content: <ProjectAppGrid apps={apps} />,
  },
  {
    id: 'doom',
    title: 'DOOM',
    icon: <DoomAppIcon size={16} />,
    status: '셰어웨어 판 · id Software',
    fill: true,
    // 게임 화면(8:5)이 창 본문에 꼭 맞는 크기. 창이 줄어들어도 남는 부분은 검은 여백이 된다
    width: 660,
    height: 464,
    content: <DoomFrame windowId="doom" />,
  },
  ...PROJECTS.map((project) => ({
    id: `project/${project.slug}`,
    title: project.name,
    icon: <ProjectAppGlyph size={16} letter={project.nameEn.charAt(0)} />,
    showAddress: true,
    status: `${project.name} · ${project.period}`,
    width: 960,
    height: 760,
    content: (
      <div className="px-4 py-6 sm:px-8">
        <article className="mx-auto max-w-3xl">
          <ProjectDetail project={project} />
        </article>
      </div>
    ),
  })),
];

export default function PortfolioPage() {
  return (
    <>
      <h1 className="sr-only">
        {PROFILE.name} · {PROFILE.title} 포트폴리오
      </h1>
      <Win95WindowManager
        windows={windows}
        desktopIcons={desktopIcons}
        github={PROFILE.github}
        email={PROFILE.email}
      />
    </>
  );
}

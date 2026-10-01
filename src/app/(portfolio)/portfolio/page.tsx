/**
 * @file page.tsx
 * @description 포트폴리오 바탕화면. 포트폴리오에서 실제 경로는 이것 하나이고, 창은 Win95WindowManager가
 *              가상 경로로 연다. 창 내용은 여기서 서버 렌더링해 넘기며, 열린 창의 내용만 화면에 그린다.
 *              DB를 거치지 않고 lib/constants/portfolio.ts만 참조해 정적으로 렌더링한다.
 */

import PortfolioAbout from '@/components/project/PortfolioAbout';
import ProjectAppGrid from '@/components/project/ProjectAppGrid';
import ProjectDetail from '@/components/project/ProjectDetail';
import { FolderIcon, ProfileAppIcon, ProjectAppGlyph } from '@/components/project/Win95Icons';
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
  ...PROJECTS.map((project) => ({
    id: `project/${project.slug}`,
    title: project.name,
    icon: <ProjectAppGlyph size={16} letter={project.nameEn.charAt(0)} />,
    showAddress: true,
    status: `${project.name} · ${project.period}`,
    width: 960,
    height: 760,
    // 긴 글을 읽는 영역이라 픽셀 폰트 대신 본문 폰트를 쓴다
    content: (
      <div className="px-5 py-10 font-sans text-base sm:px-10">
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

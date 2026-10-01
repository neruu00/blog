/**
 * @file page.tsx
 * @description 바탕화면의 project 폴더 창. 프로젝트마다 앱 아이콘을 하나씩 두고, 클릭하면 프로젝트 문서를 연다.
 */

import ProjectAppGrid from '@/components/project/ProjectAppGrid';
import Win95Window from '@/components/project/Win95Window';
import { PROFILE, PROJECTS } from '@/lib/constants/portfolio';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description: PROFILE.summary,
};

const apps = PROJECTS.map(({ slug, name, nameEn, period, claim, cover }) => ({
  slug,
  name,
  nameEn,
  period,
  claim,
  cover,
}));

export default function ProjectFolderPage() {
  return (
    <Win95Window
      title="project"
      address="C:\neru.win\portfolio\project"
      closeHref="/portfolio"
      closeLabel="바탕화면으로"
      status={`개체 ${PROJECTS.length}개`}
    >
      <h1 className="sr-only">프로젝트</h1>
      <ProjectAppGrid apps={apps} />
    </Win95Window>
  );
}

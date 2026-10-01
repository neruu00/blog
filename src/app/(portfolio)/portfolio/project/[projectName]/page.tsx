/**
 * @file page.tsx
 * @description 프로젝트 상세 페이지. lib/constants/portfolio.ts의 프로젝트별로 빌드 시점에 정적 생성된다.
 */

import { notFound } from 'next/navigation';

import AdjacentNav from '@/components/common/AdjacentNav';
import TableOfContents from '@/components/common/TableOfContents';
import ProjectDetail, { buildProjectToc } from '@/components/project/ProjectDetail';
import { ProjectAppGlyph } from '@/components/project/Win95Icons';
import Win95Window from '@/components/project/Win95Window';
import { getProjectBySlug, PROJECTS } from '@/lib/constants/portfolio';
import { SITE_URL } from '@/lib/constants/site';

import type { Metadata } from 'next';

interface ProjectDetailPageProps {
  params: Promise<{ projectName: string }>;
}

/** 목록에 없는 이름은 렌더링을 시도하지 않고 바로 404를 반환한다 */
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ projectName: project.slug }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { projectName } = await params;
  const project = getProjectBySlug(projectName);
  if (!project) return {};

  const { cover } = project;

  return {
    title: project.name,
    description: project.tagline,
    openGraph: {
      title: project.name,
      description: project.tagline,
      images: [{ url: `${SITE_URL}${cover.src}`, width: cover.width, height: cover.height }],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectName } = await params;
  const index = PROJECTS.findIndex((project) => project.slug === projectName);
  if (index === -1) notFound();

  const project = PROJECTS[index];
  const prev = PROJECTS[index - 1];
  const next = PROJECTS[index + 1];

  const toc = buildProjectToc(project);

  return (
    // 같은 페이지 컴포넌트가 재사용돼 창 본문의 스크롤 위치가 이전 문서에 남지 않도록 문서마다 새로 마운트한다
    <Win95Window
      key={project.slug}
      title={project.name}
      icon={<ProjectAppGlyph size={16} letter={project.nameEn.charAt(0)} />}
      address={`C:\\neru.win\\portfolio\\project\\${project.slug}`}
      closeHref="/portfolio/project"
      closeLabel="project 폴더로"
      upHref="/portfolio/project"
      status={`${project.name} · ${project.period}`}
    >
      {/* 긴 글을 읽는 영역이라 픽셀 폰트 대신 본문 폰트를 쓴다 */}
      <div className="relative flex px-5 py-10 font-sans text-base sm:px-10 xl:gap-8">
        <article className="mx-auto max-w-3xl min-w-0 flex-1">
          <ProjectDetail project={project} />

          <AdjacentNav
            prev={prev ? { href: `/portfolio/project/${prev.slug}`, title: prev.name } : null}
            next={next ? { href: `/portfolio/project/${next.slug}`, title: next.name } : null}
            prevLabel="이전 프로젝트"
            nextLabel="다음 프로젝트"
          />
        </article>

        <div className="hidden xl:block">
          <TableOfContents items={toc} />
        </div>
      </div>
    </Win95Window>
  );
}

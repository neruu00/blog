/**
 * @file page.tsx
 * @description 프로젝트 상세 페이지. lib/constants/portfolio.ts의 프로젝트별로 빌드 시점에 정적 생성된다.
 */

import { notFound } from 'next/navigation';

import AdjacentNav from '@/components/common/AdjacentNav';
import BackLink from '@/components/common/BackLink';
import TableOfContents from '@/components/common/TableOfContents';
import ProjectDetail, { buildProjectToc } from '@/components/project/ProjectDetail';
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
    <>
      <BackLink href="/projects">목록으로</BackLink>

      <div className="relative flex xl:gap-8">
        <article className="mx-auto max-w-3xl flex-1">
          <ProjectDetail project={project} />

          <AdjacentNav
            prev={prev ? { href: `/projects/${prev.slug}`, title: prev.name } : null}
            next={next ? { href: `/projects/${next.slug}`, title: next.name } : null}
            prevLabel="이전 프로젝트"
            nextLabel="다음 프로젝트"
          />
        </article>

        <div className="hidden xl:block">
          <TableOfContents items={toc} />
        </div>
      </div>
    </>
  );
}

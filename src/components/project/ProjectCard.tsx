/**
 * @file ProjectCard.tsx
 * @description /projects 목록의 프로젝트 카드. 대표 캡처 위에 어두운 오버레이를 깔고 기간·이름·주장을 표시한다.
 *              카드를 클릭하면 상세 페이지로 이동한다.
 */

import Link from 'next/link';

import ProjectThumbnail from '@/components/project/ProjectThumbnail';
import type { Project } from '@/lib/constants/portfolio';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { slug, name, nameEn, claim, period, cover } = project;

  // 어두운 오버레이 위에 표시되므로 텍스트 3단계 계층(gray-900/500/400) 대신 흰색 계열을 사용한다
  return (
    <article className="group overflow-hidden rounded-[1px] bg-gray-800">
      <Link href={`/projects/${slug}`} className="relative block">
        <ProjectThumbnail media={cover} />

        <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-gray-900/95 via-gray-900/60 to-gray-900/0 p-6">
          <p className="text-xs text-white/70">{period}</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <span className="text-sm text-white/70">{nameEn}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/80">{claim}</p>
        </div>
      </Link>
    </article>
  );
}

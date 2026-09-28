/**
 * @file ProjectCard.tsx
 * @description /projects 목록의 프로젝트 카드. 첫 번째 캡처 이미지를 대표 이미지로 사용하고 상세 페이지로 연결한다.
 */

import Link from 'next/link';

import ProjectThumbnail from '@/components/portfolio/ProjectThumbnail';
import { getCoverImage } from '@/lib/constants/portfolio';
import type { Project } from '@/lib/constants/portfolio';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { slug, name, nameEn, tagline, period, team, role, stack } = project;
  const thumbnail = getCoverImage(project);

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-orange-300">
      <Link href={`/projects/${slug}`} className="block">
        {thumbnail && <ProjectThumbnail media={thumbnail} />}

        <div className="p-6">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-orange-500">
              {name}
            </h3>
            <span className="text-sm text-gray-400">{nameEn}</span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">{tagline}</p>

          <p className="mt-4 text-xs text-gray-400">
            {period} · {team} · {role}
          </p>

          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {stack.map((tech) => (
              <li key={tech} className="text-xs text-gray-400">
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </article>
  );
}

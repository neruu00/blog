/**
 * @file ProjectSection.tsx
 * @description 포트폴리오 프로젝트 하나를 렌더링한다.
 *              읽는 순서를 강제한다: 이름·한 줄 → 메타 → 기술적 도전 → 기술 스택.
 *              스택이 맨 뒤인 건 의도다 — 나열은 부록이지 본문이 아니다.
 */

import { ArrowUpRight, Github } from 'lucide-react';

import Reveal from '@/components/ui/Reveal';
import type { Project } from '@/lib/constants/portfolio';

interface ProjectSectionProps {
  project: Project;
  /** 목차와 맞물리는 앵커 id */
  id: string;
}

export default function ProjectSection({ project, id }: ProjectSectionProps) {
  const { name, nameEn, tagline, period, team, role, links, challenges, stack } = project;

  return (
    <section id={id} className="scroll-mt-24 border-t border-gray-100 py-14 first:border-t-0">
      <Reveal>
        <header className="mb-8">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">{name}</h3>
            <span className="text-sm font-medium text-gray-400">{nameEn}</span>
          </div>

          <p className="mt-3 leading-relaxed text-gray-500">{tagline}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-400">
            <span>{period}</span>
            <span aria-hidden>·</span>
            <span>{team}</span>
            <span aria-hidden>·</span>
            <span className="text-gray-500">{role}</span>
          </div>

          {(links.github || links.demo) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {links.demo && (
                <a
                  href={links.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600"
                >
                  서비스 보기
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
              {links.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
            </div>
          )}
        </header>
      </Reveal>

      <ol className="space-y-5">
        {challenges.map((challenge, i) => (
          <li key={challenge.problem}>
            <Reveal delay={i * 60}>
              {/* 정적 카드다 — 호버 효과를 주지 않는다. 이 안에서 누를 수 있는 건 '자세히' 링크뿐 */}
              <div className="rounded-xl bg-gray-50 p-5">
                <p className="text-sm leading-relaxed font-medium text-gray-900">
                  {challenge.problem}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{challenge.solution}</p>

                {(challenge.metric || challenge.postHref) && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {challenge.metric && (
                      <span className="rounded bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                        {challenge.metric}
                      </span>
                    )}
                    {challenge.postHref && (
                      <a
                        href={challenge.postHref}
                        className="inline-flex items-center gap-0.5 text-xs font-medium text-orange-700 hover:underline"
                      >
                        자세히
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal>
        <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-1.5">
          {stack.map((tech) => (
            <li key={tech} className="text-xs text-gray-400">
              {tech}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

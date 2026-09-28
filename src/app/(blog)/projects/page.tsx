/**
 * @file page.tsx
 * @description 포트폴리오 페이지. 소개·기술·교육 및 프로젝트 카드 목록을 보여준다.
 *              DB를 거치지 않고 lib/constants/portfolio.ts만 참조해 정적으로 렌더링한다.
 */

import ProjectCard from '@/components/portfolio/ProjectCard';
import Reveal from '@/components/ui/Reveal';
import { EDUCATIONS, PROFILE, PROJECTS, SKILL_GROUPS } from '@/lib/constants/portfolio';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description: PROFILE.summary,
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-16">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{PROFILE.name}</h1>
        <p className="mt-1 text-sm font-medium text-orange-500">{PROFILE.title}</p>
      </header>

      <Reveal>
        <section className="mb-20">
          <p className="text-lg leading-relaxed font-medium text-gray-900">{PROFILE.summary}</p>
        </section>
      </Reveal>

      <Reveal>
        <section className="mb-20">
          <h2 className="mb-6 text-xl font-bold text-gray-900">기술</h2>
          <dl className="space-y-4">
            {SKILL_GROUPS.map((group) => (
              <div key={group.label} className="flex flex-col gap-1 sm:flex-row sm:gap-6">
                <dt className="w-32 shrink-0 text-sm text-gray-400">{group.label}</dt>
                <dd className="text-sm text-gray-900">{group.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Reveal>

      <section className="mb-20">
        <Reveal>
          <h2 className="mb-6 text-xl font-bold text-gray-900">교육</h2>
        </Reveal>

        <ol className="space-y-6">
          {EDUCATIONS.map((education, i) => (
            <li key={education.name}>
              <Reveal delay={i * 60}>
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
                  <span className="w-40 shrink-0 text-sm text-gray-400">{education.period}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{education.name}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{education.org}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>
      <section className="mb-8">
        <Reveal>
          <h2 className="mb-2 text-xl font-bold text-gray-900">프로젝트</h2>
          <p className="mb-6 text-sm text-gray-400">
            무엇을 썼는지보다, 무엇이 막혔고 어떻게 풀었는지를 적었습니다.
          </p>
        </Reveal>

        <ul className="grid gap-6 sm:grid-cols-2">
          {PROJECTS.map((project, i) => (
            <li key={project.slug}>
              <Reveal delay={(i % 2) * 60}>
                <ProjectCard project={project} />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/**
 * @file page.tsx
 * @description 포트폴리오(소개) 페이지. DB 없이 lib/constants/portfolio.ts만 읽어 정적으로 렌더링된다.
 */

import ProjectIndex from '@/components/portfolio/ProjectIndex';
import ProjectSection from '@/components/portfolio/ProjectSection';
import Reveal from '@/components/ui/Reveal';
import { EDUCATIONS, PROFILE, PROJECTS, SKILL_GROUPS } from '@/lib/constants/portfolio';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: PROFILE.summary,
};

/** 프로젝트 앵커 id. ProjectIndex와 ProjectSection이 같은 값을 써야 링크가 맞는다. */
const projectAnchors = PROJECTS.map((project) => ({
  id: `project-${project.nameEn.toLowerCase().replace(/\s+/g, '-')}`,
  name: project.name,
}));

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Reveal은 화면에 들어오기 전까지 opacity-0이라, JS가 꺼져 있으면 보이도록 되돌린다 */}
      <noscript>
        <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
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
          <p className="mb-4 text-sm text-gray-400">
            무엇을 썼는지보다, 무엇이 막혔고 어떻게 풀었는지를 적었습니다.
          </p>
        </Reveal>

        <div className="flex gap-10">
          <div className="min-w-0 flex-1">
            {PROJECTS.map((project, i) => (
              <ProjectSection key={project.nameEn} project={project} id={projectAnchors[i].id} />
            ))}
          </div>

          <div className="hidden xl:block">
            <ProjectIndex items={projectAnchors} />
          </div>
        </div>
      </section>
    </div>
  );
}

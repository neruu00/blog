/**
 * @file PortfolioAbout.tsx
 * @description 바탕화면 about 앱 창의 내용. 소개·기술·교육을 보여준다.
 */

import { EDUCATIONS, PROFILE, SKILL_GROUPS } from '@/lib/constants/portfolio';

export default function PortfolioAbout() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-8 sm:px-8">
      <header>
        <h2 className="text-win-title text-2xl font-bold">{PROFILE.name}</h2>
        <p className="mt-1 font-bold">{PROFILE.title}</p>
        <div aria-hidden className="win-titlebar mt-3 h-[3px]" />
        <p className="mt-4 leading-relaxed">{PROFILE.summary}</p>
      </header>

      <section>
        <h3 className="mb-3 font-bold">기술</h3>
        <dl className="space-y-3">
          {SKILL_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1 sm:flex-row sm:gap-6">
              <dt className="w-28 shrink-0 text-gray-500">{group.label}</dt>
              <dd className="leading-relaxed">{group.items.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h3 className="mb-3 font-bold">교육</h3>
        <ol className="space-y-3">
          {EDUCATIONS.map((education) => (
            <li key={education.name} className="flex flex-col gap-1 sm:flex-row sm:gap-6">
              <span className="w-40 shrink-0 text-gray-500">{education.period}</span>
              <div>
                <p className="font-bold">{education.name}</p>
                <p>{education.org}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

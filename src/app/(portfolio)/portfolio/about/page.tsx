/**
 * @file page.tsx
 * @description 바탕화면의 about 앱 창. 소개·기술·교육을 보여준다.
 */

import { ProfileAppIcon } from '@/components/project/Win95Icons';
import Win95Window from '@/components/project/Win95Window';
import { EDUCATIONS, PROFILE, SKILL_GROUPS } from '@/lib/constants/portfolio';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: PROFILE.summary,
};

export default function AboutPage() {
  return (
    <Win95Window
      title="about"
      icon={<ProfileAppIcon size={16} />}
      closeHref="/portfolio"
      closeLabel="바탕화면으로"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-8 sm:px-8">
        <header>
          <h1 className="text-win-title text-2xl font-bold">{PROFILE.name}</h1>
          <p className="mt-1 font-bold">{PROFILE.title}</p>
          <div aria-hidden className="win-titlebar mt-3 h-[3px]" />
          <p className="mt-4 leading-relaxed">{PROFILE.summary}</p>
        </header>

        <section>
          <h2 className="mb-3 font-bold">기술</h2>
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
          <h2 className="mb-3 font-bold">교육</h2>
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
    </Win95Window>
  );
}

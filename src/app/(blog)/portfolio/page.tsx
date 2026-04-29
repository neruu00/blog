import { Mail, Github, ExternalLink, Calendar, MapPin, Briefcase } from 'lucide-react';
import Image from 'next/image';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Jaehyeon Woo (neruu00) - Portfolio & Resume',
};

// 프로필 데이터
const PROFILE = {
  name: '우재현 (Jaehyeon Woo)',
  nickname: 'neruu00',
  role: 'Frontend Developer',
  email: 'dnwogus4260@naver.com',
  github: 'https://github.com/neruu00',
  location: 'Seoul, South Korea',
  bio: '사용자 경험을 최우선으로 생각하는 프론트엔드 개발자입니다. 복잡한 문제를 단순하게 해결하고, 직관적이고 아름다운 UI를 구현하는 것을 좋아합니다.',
};

// 기술 스택
const SKILLS = [
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand'] },
  { category: 'Backend & Database', items: ['Node.js', 'Supabase', 'PostgreSQL'] },
  { category: 'Tools', items: ['Git', 'Figma', 'Vercel'] },
];

// 프로젝트 경험
const PROJECTS = [
  {
    name: 'neruu00.log',
    period: '2026.04 - Present',
    role: 'Full-stack',
    description:
      'Markdown과 다이어그램 렌더링을 완벽하게 지원하는 개발자 맞춤형 개인 블로그. Tiptap 에디터를 활용하여 코드 블럭과 Mermaid 다이어그램을 직관적으로 작성할 수 있도록 구축했습니다.',
    techs: ['Next.js 15', 'React 19', 'TypeScript', 'Supabase', 'Tiptap', 'Tailwind CSS'],
    links: [{ label: 'GitHub', url: 'https://github.com/neruu00/blog' }],
  },
  {
    name: '개발자 포트폴리오 템플릿',
    period: '2025.10 - 2026.02',
    role: 'Frontend',
    description:
      '자신만의 이력을 손쉽게 웹으로 배포할 수 있는 템플릿 프로젝트. 반응형 디자인과 부드러운 애니메이션을 적용하여 사용자 경험을 향상시켰습니다.',
    techs: ['React', 'Framer Motion', 'Tailwind CSS'],
    links: [],
  },
];

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-4xl py-8 sm:py-12">
      {/* 1. Hero Section */}
      <section className="mb-16 flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-orange-100 bg-orange-50 sm:h-40 sm:w-40">
          <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-orange-300 sm:text-5xl">
            N
          </span>
        </div>
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {PROFILE.name}
          </h1>
          <p className="mb-4 text-lg font-medium text-orange-500">
            {PROFILE.role} <span className="text-gray-300">|</span> @{PROFILE.nickname}
          </p>
          <p className="mb-6 max-w-2xl leading-relaxed text-gray-600">{PROFILE.bio}</p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <a
              href={`mailto:${PROFILE.email}`}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
            <a
              href={PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {PROFILE.location}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Skills Section */}
      <section className="mb-16">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Briefcase className="h-6 w-6 text-orange-500" />
          Tech Stack
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((skillGroup) => (
            <div
              key={skillGroup.category}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Projects Section */}
      <section>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Calendar className="h-6 w-6 text-orange-500" />
          Projects
        </h2>
        <div className="flex flex-col gap-8">
          {PROJECTS.map((project, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-600">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-gray-500">{project.role}</p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {project.period}
                </span>
              </div>

              <p className="leading-relaxed text-gray-600">{project.description}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {project.techs.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {project.links.length > 0 && (
                <div className="mt-4 flex gap-4 border-t border-gray-100 pt-4">
                  {project.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

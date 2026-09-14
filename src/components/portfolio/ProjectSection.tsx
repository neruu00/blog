/**
 * @file ProjectSection.tsx
 * @description 포트폴리오 프로젝트 하나를 렌더링한다.
 *
 *              읽는 순서를 강제한다:
 *              이름·한 줄 → 메타 → 왜 만들었나 → 구현 기능 → 해결한 과제 → 회고 → 스택
 *
 *              '해결한 과제'가 본문이고 나머지는 그 주변이다. 스택이 맨 뒤인 건 의도다.
 *              service·features·retrospective는 선택 — 없으면 그 블록을 건너뛴다.
 *
 *              '구현 기능'은 두 겹이다: 캡처가 있는 기능은 캐러셀로, 없는 기능은 그 아래 목록으로
 *              간다. 화면을 다 찍지 못한 프로젝트도 무엇을 만들었는지는 남길 수 있어야 한다.
 */

import { ArrowUpRight, Github } from 'lucide-react';

import FeatureCarousel from '@/components/portfolio/FeatureCarousel';
import Reveal from '@/components/ui/Reveal';
import type { Feature, Project } from '@/lib/constants/portfolio';

interface ProjectSectionProps {
  project: Project;
  /** 목차와 맞물리는 앵커 id */
  id: string;
}

/** 블록 제목 — 4종이 같은 무게로 보여야 독자가 구조를 파악한다 */
function BlockLabel({ children }: { children: React.ReactNode }) {
  return <h4 className="mb-4 text-xs font-semibold text-gray-400">{children}</h4>;
}

/** 데이터에 \n\n으로 들어온 문단 구분을 살린다 */
function Paragraphs({ text, className = '' }: { text: string; className?: string }) {
  return (
    <>
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i} className={`leading-relaxed ${i > 0 ? 'mt-3' : ''} ${className}`}>
          {paragraph}
        </p>
      ))}
    </>
  );
}

/**
 * 캡처가 없는 기능 — 캐러셀은 media가 있는 항목만 칸으로 만들므로, 나머지는 여기서 글로 받는다.
 * 화면이 있는 기능은 이미 캡처 아래 캡션으로 붙어 있어 다시 적지 않는다.
 * 캡션보다 한 단계 작게 찍는다: 캡처가 걸린 기능이 이 블록의 주인공이어야 한다.
 */
function FeatureList({ features }: { features: Feature[] }) {
  const items = features.filter((feature) => !feature.media);
  if (items.length === 0) return null;

  return (
    <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {items.map((feature) => (
        <li key={feature.title}>
          <h5 className="text-sm font-semibold text-gray-900">{feature.title}</h5>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
        </li>
      ))}
    </ul>
  );
}

const LINK_CLASS =
  'inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600';

export default function ProjectSection({ project, id }: ProjectSectionProps) {
  const {
    name,
    nameEn,
    tagline,
    period,
    team,
    role,
    links,
    service,
    features,
    challengesIntro,
    challenges,
    retrospective,
    stack,
  } = project;

  return (
    <section id={id} className="scroll-mt-24 border-t border-gray-100 py-16 first:border-t-0">
      <Reveal>
        <header className="mb-10">
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
                <a href={links.demo} target="_blank" rel="noreferrer" className={LINK_CLASS}>
                  서비스 보기
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
              {links.github && (
                <a href={links.github} target="_blank" rel="noreferrer" className={LINK_CLASS}>
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
            </div>
          )}
        </header>
      </Reveal>

      {service && (
        <Reveal>
          <div className="mb-14">
            <BlockLabel>왜 만들었나</BlockLabel>
            {/* 이어지는 하나의 논증이다 — 중간을 박스로 떼지 않는다 */}
            <Paragraphs text={service} className="text-gray-500" />
          </div>
        </Reveal>
      )}

      {features && features.length > 0 && (
        <Reveal>
          <div className="mb-14">
            <BlockLabel>구현 기능</BlockLabel>
            {/* 화면이 4:3이라 세로로 쌓으면 한 장이 뷰포트를 먹는다 — 한 칸씩 넘겨 본다 */}
            <FeatureCarousel features={features} projectName={name} />
            <FeatureList features={features} />
          </div>
        </Reveal>
      )}

      <div className="mb-14">
        <Reveal>
          <BlockLabel>해결한 과제</BlockLabel>
          {challengesIntro && (
            <p className="mb-6 leading-relaxed text-gray-500">{challengesIntro}</p>
          )}
        </Reveal>

        <ol className="space-y-4">
          {challenges.map((challenge, i) => (
            <li key={challenge.title}>
              <Reveal delay={i * 60}>
                {/* 정적 카드다 — 호버 효과를 주지 않는다. 이 안에서 누를 수 있는 건 '자세히'뿐 */}
                <div className="rounded-xl bg-gray-50 p-6">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xs font-semibold text-orange-500 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h5 className="text-base font-semibold text-gray-900">{challenge.title}</h5>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-gray-500">{challenge.problem}</p>

                  {/* 증상을 다시 정의한 문장 — 이 카드에서 유일하게 진하다 */}
                  {challenge.definition && (
                    <p className="mt-3 text-sm leading-relaxed font-medium text-gray-900">
                      {challenge.definition}
                    </p>
                  )}

                  <p className="mt-3 text-sm leading-relaxed text-gray-500">{challenge.solution}</p>

                  {(challenge.metric || challenge.postHref) && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
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
                          자세히 보기
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
      </div>

      {retrospective && (
        <Reveal>
          {/* 과제(회색)와 다른 색을 줘 '돌아본 말'로 읽히게 한다 — blockquote와 같은 처리 */}
          <div className="rounded-xl bg-orange-50 p-6">
            <BlockLabel>회고</BlockLabel>
            <Paragraphs text={retrospective} className="text-sm text-gray-500" />
          </div>
        </Reveal>
      )}

      <Reveal>
        <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-1.5">
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

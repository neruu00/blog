/**
 * @file ProjectDetail.tsx
 * @description 프로젝트 상세 페이지 본문. 페이지의 h1부터 렌더링한다.
 *              블록 순서는 이름·한 줄 소개 → 메타 → 만든 이유 → 구현 기능 → 해결한 과제 → 회고 → 스택이다.
 *              service·features·retrospective는 선택 항목이라 없으면 해당 블록을 건너뛴다.
 *              구현 기능 중 캡처가 있는 항목은 캐러셀로, 없는 항목은 그 아래 목록으로 보여준다.
 */

import { ArrowUpRight, Github } from 'lucide-react';

import PageHeader from '@/components/common/PageHeader';
import FeatureCarousel from '@/components/project/FeatureCarousel';
import Reveal from '@/components/ui/Reveal';
import type { Feature, Project } from '@/lib/constants/portfolio';

interface ProjectDetailProps {
  project: Project;
}

function BlockLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-xs font-semibold text-gray-400">{children}</h2>;
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
 * 캡처가 없는 기능 목록. 캡처가 있는 기능은 캐러셀 캡션으로 이미 보여주므로 여기서 다시 적지 않는다.
 */
function FeatureList({ features }: { features: Feature[] }) {
  const items = features.filter((feature) => !feature.media);
  if (items.length === 0) return null;

  return (
    <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {items.map((feature) => (
        <li key={feature.title}>
          <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
        </li>
      ))}
    </ul>
  );
}

const LINK_CLASS =
  'inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600';

export default function ProjectDetail({ project }: ProjectDetailProps) {
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
    <article>
      <Reveal>
        <PageHeader
          title={name}
          titleAside={<span className="text-sm font-medium text-gray-400">{nameEn}</span>}
          description={tagline}
        >
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
        </PageHeader>
      </Reveal>

      {service && (
        <Reveal>
          <div className="mb-14">
            <BlockLabel>왜 만들었나</BlockLabel>
            <Paragraphs text={service} className="text-gray-500" />
          </div>
        </Reveal>
      )}

      {features && features.length > 0 && (
        <Reveal>
          <div className="mb-14">
            <BlockLabel>구현 기능</BlockLabel>
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
                <div className="rounded-xl bg-gray-50 p-6">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xs font-semibold text-orange-500 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">{challenge.title}</h3>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-gray-500">{challenge.problem}</p>

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
    </article>
  );
}

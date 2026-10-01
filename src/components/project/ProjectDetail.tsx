/**
 * @file ProjectDetail.tsx
 * @description 프로젝트 상세 페이지 본문. 페이지의 h1부터 렌더링한다.
 *              블록 순서는 헤더 → 주장 → 소개 → 구조 → 해결한 과제 → 회고이며, 포트폴리오 슬라이드 순서와 같다.
 *              retrospective는 선택 항목이라 없으면 회고 블록을 건너뛴다.
 */

import { ArrowUpRight, Github, Globe } from 'lucide-react';
import Link from 'next/link';

import PageHeader from '@/components/common/PageHeader';
import DiagramFigure from '@/components/project/DiagramFigure';
import ImageFigure from '@/components/project/ImageFigure';
import MetricTile from '@/components/project/MetricTile';
import ProjectThumbnail from '@/components/project/ProjectThumbnail';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import type { Challenge, Project } from '@/lib/constants/portfolio';
import { cn } from '@/lib/utils';
import type { TocItem } from '@/lib/utils/tiptap';

/** 섹션 제목. 헤딩과 목차가 같은 값을 써야 목차 문구가 본문과 어긋나지 않는다 */
const SECTION_TITLE = {
  intro: '소개',
  architecture: '구조',
  challenges: '해결한 과제',
  retrospective: '회고',
} as const;

function challengeId(index: number) {
  return `challenge-${index + 1}`;
}

/**
 * 상세 페이지 목차. 반환하는 id는 ProjectDetail의 헤딩 id와 같아야 TableOfContents가 현재 위치를 찾는다.
 * 섹션은 level 2, 과제는 level 3이다.
 */
export function buildProjectToc(project: Project): TocItem[] {
  return [
    { id: 'intro', text: SECTION_TITLE.intro, level: 2 },
    { id: 'architecture', text: SECTION_TITLE.architecture, level: 2 },
    { id: 'challenges', text: SECTION_TITLE.challenges, level: 2 },
    ...project.challenges.map((challenge, i) => ({
      id: challengeId(i),
      text: challenge.title,
      level: 3,
    })),
    ...(project.retrospective
      ? [{ id: 'retrospective', text: SECTION_TITLE.retrospective, level: 2 }]
      : []),
  ];
}

interface SectionHeadingProps {
  id: string;
  children: React.ReactNode;
  /** 페이지의 첫 h2거나 배경 상자 안에 들어갈 때 위 여백을 없앤다 */
  first?: boolean;
}

/** 블로그 본문 h2와 같은 크기의 섹션 제목 */
function SectionHeading({ id, children, first = false }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className={cn('mb-5 scroll-mt-24 text-xl font-bold text-gray-900', first ? 'mt-0' : 'mt-10')}
    >
      {children}
    </h2>
  );
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

type RowTone = 'body' | 'emphasis' | 'meta' | 'metric';

/** 행 종류별 내용 스타일과, 라벨을 내용 첫 줄에 맞추는 위 여백 */
const ROW_TONE: Record<RowTone, { dd: string; dt: string }> = {
  body: { dd: 'text-base leading-relaxed text-gray-900', dt: 'sm:pt-1' },
  emphasis: { dd: 'text-base leading-relaxed font-medium text-gray-900', dt: 'sm:pt-1' },
  meta: { dd: 'text-sm leading-relaxed text-gray-500', dt: 'sm:pt-0.5' },
  metric: { dd: 'text-sm leading-relaxed text-gray-500', dt: '' },
};

interface ChallengeRowProps {
  label: string;
  children: React.ReactNode;
  tone?: RowTone;
}

/** 과제의 한 행. sm 미만에서는 라벨과 내용을 세로로 쌓는다 */
function ChallengeRow({ label, children, tone = 'body' }: ChallengeRowProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className={cn('w-12 shrink-0 text-xs font-semibold text-gray-400', ROW_TONE[tone].dt)}>
        {label}
      </dt>
      <dd className={cn('min-w-0', ROW_TONE[tone].dd)}>{children}</dd>
    </div>
  );
}

function PostLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-0.5 font-medium text-orange-700 hover:underline"
    >
      자세히 보기
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function ChallengeSection({ challenge, index }: { challenge: Challenge; index: number }) {
  const { title, problem, definition, solution, verification, limitation, metric, visuals } =
    challenge;

  return (
    <div>
      <h3
        id={challengeId(index)}
        className="flex scroll-mt-24 items-baseline gap-2.5 text-lg font-semibold text-gray-900"
      >
        <span className="text-xs font-semibold text-orange-500 tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        {title}
      </h3>

      <dl className="mt-4 space-y-3">
        <ChallengeRow label="문제">{problem}</ChallengeRow>
        {definition && (
          <ChallengeRow label="재정의" tone="emphasis">
            {definition}
          </ChallengeRow>
        )}
        <ChallengeRow label="선택">{solution}</ChallengeRow>
        {visuals && visuals.length > 0 && (
          <div className="py-2">
            {/* dl의 자식은 dt·dd 묶음이어야 해서 시각 자료도 숨긴 라벨을 단 행으로 둔다 */}
            <dt className="sr-only">시각 자료</dt>
            <dd className="space-y-4">
              {visuals.map((visual, i) =>
                visual.kind === 'diagram' ? (
                  <DiagramFigure key={i} visual={visual} />
                ) : (
                  <ImageFigure key={visual.id} visual={visual} />
                ),
              )}
            </dd>
          </div>
        )}
        {verification && (
          <ChallengeRow label="검증" tone="meta">
            {verification}
          </ChallengeRow>
        )}
        {limitation && (
          <ChallengeRow label="한계" tone="meta">
            {limitation}
          </ChallengeRow>
        )}
        {metric ? (
          <ChallengeRow label="지표" tone="metric">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
              <MetricTile metric={metric} compact />
              {challenge.postHref && <PostLink href={challenge.postHref} />}
            </div>
          </ChallengeRow>
        ) : (
          challenge.postHref && (
            <ChallengeRow label="글" tone="meta">
              <PostLink href={challenge.postHref} />
            </ChallengeRow>
          )
        )}
      </dl>
    </div>
  );
}

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const {
    name,
    nameEn,
    tagline,
    claim,
    period,
    team,
    role,
    links,
    cover,
    intro,
    architecture,
    challenges,
    retrospective,
    stack,
  } = project;

  return (
    <>
      <Reveal>
        <PageHeader
          title={name}
          titleAside={
            <span className="flex items-center gap-1 self-center">
              <span className="text-sm font-medium text-gray-400">{nameEn}</span>
              {links.github && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  href={links.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub 저장소"
                  title="GitHub 저장소"
                >
                  <Github className="h-4 w-4" />
                </Button>
              )}
              {links.demo && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  href={links.demo}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="배포된 서비스"
                  title="배포된 서비스"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              )}
            </span>
          }
          description={tagline}
        >
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span>{period}</span>
            <span aria-hidden className="text-gray-400">
              ·
            </span>
            <span>{team}</span>
            <span aria-hidden className="text-gray-400">
              ·
            </span>
            <span>{role}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{stack.join(' · ')}</p>
        </PageHeader>
      </Reveal>

      <Reveal>
        <p className="mb-14 text-lg leading-relaxed font-medium text-gray-900">{claim}</p>
      </Reveal>

      <Reveal>
        <section>
          <SectionHeading id="intro" first>
            {SECTION_TITLE.intro}
          </SectionHeading>
          <div className="overflow-hidden rounded-xl">
            <ProjectThumbnail media={cover} sizes="(min-width: 768px) 768px, 100vw" />
          </div>
          <p className="mt-6 text-base leading-relaxed text-gray-900">{intro}</p>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <SectionHeading id="architecture">{SECTION_TITLE.architecture}</SectionHeading>
          <DiagramFigure visual={architecture} />
        </section>
      </Reveal>

      <section>
        <Reveal>
          <SectionHeading id="challenges">{SECTION_TITLE.challenges}</SectionHeading>
        </Reveal>

        <ol className="space-y-12">
          {challenges.map((challenge, i) => (
            <li key={challenge.title}>
              <Reveal delay={i * 60}>
                <ChallengeSection challenge={challenge} index={i} />
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {retrospective && (
        <Reveal>
          <section className="mt-10 rounded-xl bg-orange-50 p-6">
            <SectionHeading id="retrospective" first>
              {SECTION_TITLE.retrospective}
            </SectionHeading>
            <Paragraphs text={retrospective} className="text-sm text-gray-500" />
          </section>
        </Reveal>
      )}
    </>
  );
}

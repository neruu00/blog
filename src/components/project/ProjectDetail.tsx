/**
 * @file ProjectDetail.tsx
 * @description /portfolio 프로젝트 문서 창의 본문. Windows 95 문서처럼 섹션 제목은 제목줄 띠로,
 *              기본 정보와 과제는 그룹 상자로 묶는다. 문서의 h1부터 렌더링한다.
 *              블록 순서는 헤더 → 소개 → 구조 → 문제와 해결 → 회고이며, 포트폴리오 슬라이드 순서와 같다.
 *              retrospective는 선택 항목이라 없으면 회고 블록을 건너뛴다.
 */

import { ArrowUpRight, Github, Globe } from 'lucide-react';

import DiagramFigure from '@/components/project/DiagramFigure';
import ImageFigure from '@/components/project/ImageFigure';
import MetricTile from '@/components/project/MetricTile';
import ProjectThumbnail from '@/components/project/ProjectThumbnail';
import Win95Button from '@/components/project/Win95Button';
import type { Challenge, Project } from '@/lib/constants/portfolio';
import { cn } from '@/lib/utils';

const SECTION_TITLE = {
  intro: '소개',
  architecture: '서비스 구조',
  challenges: '문제와 해결',
  retrospective: '배운 점과 아쉬운 점',
} as const;

/** 헤딩 id. #challenge-1 같은 링크로 해당 과제에 바로 갈 수 있다 */
function challengeId(index: number) {
  return `challenge-${index + 1}`;
}

interface SectionHeadingProps {
  id: string;
  children: React.ReactNode;
}

/** 주황 제목줄 띠 모양의 섹션 제목 */
function SectionHeading({ id, children }: SectionHeadingProps) {
  return (
    <h2 id={id} className="win-titlebar mt-8 mb-4 scroll-mt-4 px-2 py-1 font-bold text-white">
      {children}
    </h2>
  );
}

interface GroupBoxProps {
  /** 테두리 왼쪽 위에 붙는 이름. 헤딩을 넣을 수 있다 */
  legend: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Windows 95 그룹 상자. 회색 선과 흰 선을 겹친 홈 파인 테두리에 이름을 붙인다 */
function GroupBox({ legend, children, className }: GroupBoxProps) {
  return (
    <fieldset
      className={cn(
        'border-win-shadow min-w-0 border px-3 pt-1 pb-3 shadow-[inset_1px_1px_var(--color-white),1px_1px_var(--color-white)]',
        className,
      )}
    >
      <legend className="px-1">{legend}</legend>
      {children}
    </fieldset>
  );
}

/** 데이터에 \n\n으로 들어온 문단 구분을 살린다 */
function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i} className={i > 0 ? 'mt-3' : ''}>
          {paragraph}
        </p>
      ))}
    </>
  );
}

type RowTone = 'body' | 'emphasis' | 'meta';

const ROW_TONE: Record<RowTone, string> = {
  body: '',
  emphasis: 'font-bold',
  meta: 'text-gray-500',
};

interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
  tone?: RowTone;
}

/** 정보 상자의 행. 속성 창처럼 "이름:" 라벨과 값을 나란히 놓고, sm 미만에서는 세로로 쌓는다 */
function PropertyRow({ label, children, tone = 'body' }: PropertyRowProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-14 shrink-0 text-gray-500">{label}:</dt>
      <dd className={cn('min-w-0', ROW_TONE[tone])}>{children}</dd>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  tone?: RowTone;
}

/** 과제 항목. 라벨을 굵은 소제목으로 두고 내용을 그 아래에 쌓는다 */
function Field({ label, children, tone = 'body' }: FieldProps) {
  return (
    <div>
      <dt className="font-bold">{label}</dt>
      <dd className={cn('mt-1 min-w-0', ROW_TONE[tone])}>{children}</dd>
    </div>
  );
}

/** 이 과제를 다룬 블로그 글. 포트폴리오 바탕화면을 떠나지 않도록 새 탭에서 연다 */
function PostLink({ href }: { href: string }) {
  return (
    <Win95Button href={href} target="_blank" rel="noreferrer">
      자세히 보기
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Win95Button>
  );
}

function ChallengeSection({ challenge, index }: { challenge: Challenge; index: number }) {
  const { title, problem, definition, solution, verification, limitation, metric, visuals } =
    challenge;

  return (
    <GroupBox
      legend={
        <h3 id={challengeId(index)} className="flex scroll-mt-4 items-baseline gap-1.5 font-bold">
          <span className="text-win-title">{String(index + 1).padStart(2, '0')}</span>
          {title}
        </h3>
      }
    >
      <dl className="mt-2 space-y-4">
        <Field label="문제">{problem}</Field>
        {definition && (
          <Field label="접근 방법" tone="emphasis">
            {definition}
          </Field>
        )}
        <Field label="해결 방법">{solution}</Field>
        {visuals && visuals.length > 0 && (
          <div className="py-1">
            {/* dl의 자식은 dt·dd 묶음이어야 해서 시각 자료도 숨긴 라벨을 단 행으로 둔다 */}
            <dt className="sr-only">도표와 이미지</dt>
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
          <Field label="확인 결과" tone="meta">
            {verification}
          </Field>
        )}
        {limitation && (
          <Field label="한계" tone="meta">
            {limitation}
          </Field>
        )}
        {(metric || challenge.postHref) && (
          <Field label={metric ? '수치' : '관련 글'}>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              {metric && <MetricTile metric={metric} />}
              {challenge.postHref && <PostLink href={challenge.postHref} />}
            </div>
          </Field>
        )}
      </dl>
    </GroupBox>
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
    <div className="leading-relaxed">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-win-title text-2xl font-bold">{name}</h1>
          <span className="text-gray-500">{nameEn}</span>
          <span className="flex gap-1.5">
            {links.github && (
              <Win95Button href={links.github} target="_blank" rel="noreferrer">
                <Github className="h-3.5 w-3.5" />
                GitHub
              </Win95Button>
            )}
            {links.demo && (
              <Win95Button href={links.demo} target="_blank" rel="noreferrer">
                <Globe className="h-3.5 w-3.5" />
                서비스
              </Win95Button>
            )}
          </span>
        </div>
        <p className="mt-2">{tagline}</p>

        <GroupBox legend={<span className="font-bold">정보</span>} className="mt-4">
          <dl className="mt-1 space-y-1">
            <PropertyRow label="기간">{period}</PropertyRow>
            <PropertyRow label="인원">{team}</PropertyRow>
            <PropertyRow label="역할">{role}</PropertyRow>
            <PropertyRow label="기술">{stack.join(' · ')}</PropertyRow>
          </dl>
        </GroupBox>
      </header>

      <section>
        <SectionHeading id="intro">{SECTION_TITLE.intro}</SectionHeading>
        <div className="win-sunken bg-win-face p-[2px]">
          <ProjectThumbnail media={cover} sizes="(min-width: 768px) 768px, 100vw" />
        </div>
        <p className="mt-4">{intro}</p>
      </section>

      <section>
        <SectionHeading id="architecture">{SECTION_TITLE.architecture}</SectionHeading>
        <DiagramFigure visual={architecture} />
      </section>

      <section>
        <SectionHeading id="challenges">{SECTION_TITLE.challenges}</SectionHeading>
        <ol className="space-y-5">
          {challenges.map((challenge, i) => (
            <li key={challenge.title}>
              <ChallengeSection challenge={challenge} index={i} />
            </li>
          ))}
        </ol>
      </section>

      {retrospective && (
        <section>
          <SectionHeading id="retrospective">{SECTION_TITLE.retrospective}</SectionHeading>
          <Paragraphs text={retrospective} />
        </section>
      )}
    </div>
  );
}

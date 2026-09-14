/**
 * @file portfolio.ts
 * @description /about 포트폴리오 페이지의 단일 데이터 출처.
 *
 *              타입이 서사를 강제한다: 기술 나열이 아니라 "무엇이 막혔고(problem)
 *              어떻게 풀었는지(solution)"가 필수다. stack은 맨 뒤 — 부록이지 본문이 아니다.
 *              배열 순서가 곧 화면 순서다.
 */

export interface Challenge {
  /** 무엇이 막혔나 */
  problem: string;
  /** 어떻게 풀었나 */
  solution: string;
  /** 수치로 말할 수 있을 때만. 배지로 강조되므로 남발하면 강조가 죽는다 */
  metric?: string;
  /** 이 문제를 깊게 다룬 블로그 글 — 주장에서 근거로 바로 넘어가는 통로 */
  postHref?: string;
}

export interface Project {
  name: string;
  nameEn: string;
  /** 리뷰어가 3초 안에 판단하는 한 줄 */
  tagline: string;
  period: string;
  team: string;
  role: string;
  links: { github?: string; demo?: string };
  challenges: Challenge[];
  stack: string[];
}

export interface Education {
  name: string;
  org: string;
  period: string;
  description?: string;
}

export const PROFILE = {
  name: '우재현',
  title: 'Frontend Developer',
  /** 한 문단 소개 — 무엇을 하는 사람인지 */
  summary:
    '실시간 데이터와 복잡한 인증 환경에서 발생하는 상태 불일치 문제를 해결하는 프론트엔드 개발자입니다.',
  detail:
    '호출 순서와 상태 흐름을 추적해 문제의 원인을 구조적으로 정의하고, 반복되거나 복잡한 문제를 공통 모듈과 데이터 모델로 추상화해 해결합니다. 백엔드 구조에 관한 이해를 바탕으로 API와 인증 정책을 함께 조율하며 개발합니다.',
  photo: '/profile.jpg',
  email: 'dnwogus4260@naver.com',
  github: 'https://github.com/neruu00',
} as const;

/** 순서는 소유자가 정한 그대로다 — 최신순이 아니라 의도된 배치 */
export const PROJECTS: Project[] = [
  {
    name: '세코미',
    nameEn: 'SeCoMe',
    tagline: '음성 회의를 회의록으로 정리하고, 그 내용을 팀 문서에 바로 반영하는 협업 서비스',
    period: '2026.07 ~ 2026.08',
    team: '6인',
    role: '프론트엔드',
    links: { github: 'https://github.com/jeongsanghoedam/secome' },
    challenges: [
      {
        problem: 'Refresh Token Rotation 환경에서 동시에 도착한 401 응답이 인증을 무효화했습니다.',
        solution:
          'Single Flight를 적용해 세션 문제를 해결하고 토큰 재발급 요청을 1회로 고정했습니다.',
        metric: '토큰 재발급 1회로 고정',
        postHref: '/posts/37f16e6f-496d-441e-ad84-94516c575b64',
      },
      {
        problem: '캐시 무효화가 호출부마다 흩어져 누락 위험이 7곳 존재했습니다.',
        solution: '무효화 규칙을 공용 모듈로 일원화해 위험 지점을 1곳으로 줄였습니다.',
        metric: '누락 위험 7곳 → 1곳',
      },
      {
        problem:
          'LiveKit 데이터 채널은 서버가 로그를 보관하지 않아, 회의 채팅에서 첫 입장·재연결·중복 수신 시 상태가 어긋났습니다.',
        solution:
          'Grow Only Set과 연속 구간까지만 전진하는 워터마크로 동기화해 세 경우를 단일 델타 경로로 수렴시켰습니다.',
      },
      {
        problem: '일반 채팅은 구독·조회 경합으로 메시지가 유실됐습니다.',
        solution:
          '구독을 먼저 진행해 유실을 막고, 재연결 시 마지막으로 수신한 ID부터 커서를 당겨오는 보정 루프와 채팅 ID 기준 멱등 병합으로 중복을 해결했습니다.',
      },
    ],
    stack: ['Next.js 15', 'React 19', 'TypeScript', 'WebSocket', 'STOMP', 'WebRTC'],
  },
  {
    name: '펭귄밀크',
    nameEn: 'Penguin Milk',
    tagline: '실시간 시세 기반 모의 투자 서비스',
    period: '2026.08 ~ 진행 중',
    team: '6인',
    role: '프론트엔드',
    links: { demo: 'https://j15e103.p.ssafy.io/' },
    challenges: [
      {
        problem:
          '지난 프로젝트에서는 기능 구현에만 시간을 다 써, 유저 테스트와 개선에는 손대지 못했습니다.',
        solution:
          'Speckit 기반 SDD로 요구사항과 예외 상황을 먼저 확정했습니다. 스펙에 2주를 선투자해 MVP를 1주에 완성했고, 자잘한 변경은 있었으나 핵심 기능 스펙은 끝까지 바뀌지 않았습니다. 확보한 3주는 UI 개선·렌더링 최적화·실시간 데이터 정합성 검증에 썼습니다.',
        metric: '6주 중 3주를 개선에 투입',
      },
      {
        problem:
          'REST 초기 조회와 실시간 시세 이벤트의 도착 순서가 보장되지 않아 오래된 데이터가 최신 데이터를 덮어썼습니다.',
        solution:
          '렌더링 문제가 아닌 데이터 정합성 문제로 정의하고, 종목별 시퀀스를 기준으로 이벤트를 병합해 화면 상태가 최신 값으로 수렴하도록 구현했습니다.',
      },
      {
        problem:
          '초보 투자자가 현재가·등락률·차트·거래량과 보조 지표를 한꺼번에 보며 정보 과부하를 겪었습니다.',
        solution:
          '종목 화면의 정보를 핵심·보조·학습 정보로 나누어 배치했습니다. 필요한 정보를 먼저 보고 상세 지표는 단계적으로 학습하도록 위계를 설계했습니다.',
      },
    ],
    stack: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'TanStack Query', 'Zustand'],
  },
  {
    name: '바리스테이션',
    nameEn: 'Baristation',
    tagline: '사용자 맞춤 원두 추천과 바리스타 클래스 예약 제공 플랫폼',
    period: '2026.03 ~ 2026.05',
    team: '5인',
    role: '프론트엔드',
    links: { github: 'https://github.com/Baristation/baristation-frontend' },
    challenges: [
      {
        problem: '외부 요청 URL을 BFF가 그대로 전달할 경우 내부망 접근으로 이어질 수 있었습니다.',
        solution:
          'BFF에서 목적지 호스트를 고정하고 URL 절대경로 입력을 차단해 SSRF 공격 경로를 제거했습니다.',
      },
      {
        problem:
          'BFF 도입 후 인증 쿠키가 서드파티 쿠키로 인식되어 로그인 상태가 유지되지 않았습니다.',
        solution:
          '인증 요청을 BFF를 통해 동일 사이트 요청으로 프록시하고, 인증 쿠키를 퍼스트파티 컨텍스트에서 전달하도록 구현했습니다.',
        postHref: '/posts/6670dbf2-db42-44d7-9e8c-ac864a536835',
      },
      {
        problem: 'httpOnly 쿠키와 BFF 헤더 때문에 Postman에서 인증 요청을 재현할 수 없었습니다.',
        solution:
          '팀 내 API Playground를 구현해 인증이 필요한 API를 브라우저에서 즉시 검증할 수 있게 했습니다.',
      },
    ],
    stack: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS'],
  },
  {
    name: '구루밍',
    nameEn: 'Gourming',
    tagline: '지도 기반 맛집 저장·리뷰 SNS',
    period: '2026.06',
    team: '2인',
    role: '서비스 아키텍처 설계 및 프론트엔드 중심 풀스택 개발',
    links: { github: 'https://github.com/MongGe-MongGe/frontend' },
    challenges: [
      {
        problem:
          '외부 API 데이터를 그대로 저장할 경우 식별자 조작과 중복 데이터가 유입될 수 있었습니다.',
        solution:
          '외부 데이터의 식별자·필수 필드·중복 여부를 서버의 데이터 검증 책임으로 정의하고 저장 전 검증하도록 구성했습니다.',
      },
      {
        problem:
          '이미지 업로드와 게시글 저장이 분리되어 실패 시 스토리지에 고아 이미지가 남았습니다.',
        solution:
          '업로드·게시글 연결·사용 여부 갱신·고아 이미지 정리의 4단계 생명주기를 설계하고, 사용되지 않는 이미지를 스케줄러로 정리하도록 구현했습니다.',
      },
      {
        problem: '피드가 중복 노출되며 좋아요 상태가 어긋났습니다.',
        solution:
          '피드를 컨텍스트 단위로 캐싱하고, 좋아요를 모든 컨텍스트를 갱신하는 연산으로 재정의해 화면 간 상태를 일관되게 유지했습니다.',
      },
      {
        problem: '좋아요·팔로우 연속 클릭 때 중복 요청과 카운트 불일치가 발생했습니다.',
        solution:
          '낙관적 업데이트와 실패 시 롤백을 적용하고, 인플라이트 가드로 중복을 차단했습니다.',
      },
    ],
    stack: ['Vue 3', 'TypeScript', 'Pinia', 'Tailwind CSS', 'Spring Boot'],
  },
  {
    name: '쿠션',
    nameEn: 'Cushion',
    tagline: '프로젝트 문서를 한 곳에 모으고, 에이전트가 필요한 섹션만 읽고 쓰는 협업 서비스',
    period: '2026.08 ~ 진행 중',
    team: '1인',
    role: '프론트엔드',
    links: { github: 'https://github.com/neruu00/cushion' },
    challenges: [
      {
        problem: '사람과 에이전트가 같은 문서를 동시에 편집하면 변경이 덮어써졌습니다.',
        solution:
          '콘텐츠 해시 기반 낙관적 동시성 제어로 충돌을 감지했습니다. 자동 병합 대신 작성 중인 내용과 서버 본문을 비교하게 해, 저장 실패와 충돌 상황에서도 사용자 입력이 사라지지 않도록 구현했습니다.',
      },
      {
        problem: '이력 목록에서 버전 본문과 diff를 함께 조회해 응답이 과도하게 컸습니다.',
        solution: '메타데이터 전용 조회와 커서 페이지네이션으로 변경했습니다.',
        metric: '886KB → 60KB (−93.2%)',
      },
      {
        problem:
          'URL 라우팅으로 언어를 나누면 경로가 갈라지고, 전환 기능이 클라이언트 번들을 불리는 문제가 있었습니다.',
        solution:
          '쿠키·접속 국가·Accept-Language q값을 우선순위로 판별해 한국어·영어를 지원하고, 필요한 언어 리소스만 로드하도록 구성했습니다.',
      },
    ],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'shadcn/ui', 'Vercel', 'Supabase'],
  },
];

export const SKILL_GROUPS: { label: string; items: string[] }[] = [
  {
    label: '프레임워크 · 상태',
    items: ['Next.js', 'React', 'TypeScript', 'TanStack Query', 'Zustand'],
  },
  { label: '스타일링', items: ['Tailwind CSS', 'shadcn/ui'] },
  { label: '협업', items: ['Github', 'Jira', 'Notion', 'Figma', 'Discord', 'Storybook'] },
];

export const EDUCATIONS: Education[] = [
  {
    name: '동의대학교',
    org: '응용소프트웨어공학과',
    period: '2019.03 ~ 2026.02',
  },
  {
    name: '프론트엔드 엔지니어 부트캠프',
    org: '코드잇',
    period: '2024.08 ~ 2025.02',
    description:
      'HTML·CSS·JavaScript와 React를 기반으로 웹 표준·접근성을 준수한 SPA를 구현하고, 4회의 협업 프로젝트를 수행했습니다.',
  },
  {
    name: '삼성 청년 SW·AI 아카데미 SSAFY',
    org: '삼성전자',
    period: '2026.02 ~ 2026.12 (예정)',
    description:
      'Java 기반 백엔드 트랙을 이수하며 서버 구조와 데이터 흐름을 이해했고, 3회의 프로젝트에서 프론트엔드 개발자로서 백엔드 개발자와 효과적으로 협업하는 역량을 길렀습니다.',
  },
];

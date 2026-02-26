export interface BlogPost {
  title: string;
  author: string;
  tags: string[];
  content: Record<string, any>; // Tiptap JSON
  createdAt: Date;
  updatedAt: Date;
}

// Tiptap JSON 생성을 도와주는 헬퍼 함수 (MOCK 데이터용)
const generateTiptapJSON = (heading: string, paragraph: string) => ({
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: heading }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: paragraph }],
    },
  ],
});

export const mockPosts: BlogPost[] = [
  {
    title: 'Next.js와 Supabase로 사내 채팅 서비스 구축하기',
    author: '우재현',
    tags: ['Next.js', 'Supabase', 'Websocket'],
    content: generateTiptapJSON(
      '실시간 통신의 필요성',
      'Supabase의 Realtime 기능을 활용하여 Next.js App Router 환경에서 가벼운 사내 채팅 서비스를 구축하는 과정을 정리했습니다.',
    ),
    createdAt: new Date('2025-10-25T09:00:00Z'),
    updatedAt: new Date('2025-10-26T10:30:00Z'),
  },
  {
    title: '뽀모도로 타이머 익스텐션 개발과 애니메이션 최적화',
    author: '우재현',
    tags: ['React', 'Tailwind CSS', 'Chrome Extension'],
    content: generateTiptapJSON(
      '생산성을 높이는 뽀모도로 기법',
      'React와 Tailwind CSS를 사용하여 브라우저 익스텐션을 개발했습니다. 화면 내 캐릭터 애니메이션의 렌더링을 최적화한 경험을 공유합니다.',
    ),
    createdAt: new Date('2025-11-16T14:20:00Z'),
    updatedAt: new Date('2025-11-16T14:20:00Z'),
  },
  {
    title: 'Server-Driven UI(SDUI) 프론트엔드 아키텍처 도입 고민',
    author: '우재현',
    tags: ['Architecture', 'SDUI', 'React'],
    content: generateTiptapJSON(
      'SDUI란 무엇인가?',
      '클라이언트의 배포 없이 UI를 유연하게 변경하기 위해 Server-Driven UI 도입을 검토하며 느낀 장단점과 설계 로직을 정리해 보았습니다.',
    ),
    createdAt: new Date('2025-12-05T11:15:00Z'),
    updatedAt: new Date('2025-12-08T09:00:00Z'),
  },
  {
    title: '인터랙티브한 프론트엔드 개발자 포트폴리오 제작기',
    author: '우재현',
    tags: ['Portfolio', 'Next.js', 'Animation'],
    content: generateTiptapJSON(
      '나를 표현하는 공간',
      '다양한 인터랙티브 애니메이션과 섹션을 구성하여 나만의 프론트엔드 포트폴리오 웹사이트를 개발한 과정을 기록합니다.',
    ),
    createdAt: new Date('2026-01-16T16:45:00Z'),
    updatedAt: new Date('2026-01-20T13:20:00Z'),
  },
  {
    title: '탭 그룹 관리를 위한 크롬 익스텐션 Zenless Navigation 개발기',
    author: '우재현',
    tags: ['Chrome Extension', 'React', 'Side Project'],
    content: generateTiptapJSON(
      '수많은 탭의 늪에서 벗어나기',
      '브라우저 탭을 효율적으로 관리하고 저장하기 위한 Zenless Navigation 익스텐션의 기능 설계와 상태 관리 로직에 대해 다룹니다.',
    ),
    createdAt: new Date('2026-02-01T20:30:00Z'),
    updatedAt: new Date('2026-02-19T10:00:00Z'),
  },
  {
    title: 'Tailwind CSS v4의 새로운 @theme inline 문법 파헤치기',
    author: '우재현',
    tags: ['Tailwind CSS', 'CSS', 'Frontend'],
    content: generateTiptapJSON(
      '설정 파일 없는 CSS 패러다임',
      '최근 업데이트된 Tailwind CSS v4에서 tailwind.config.js를 대체하는 새로운 @theme inline 문법을 프로젝트에 적용해 보았습니다.',
    ),
    createdAt: new Date('2026-02-10T08:10:00Z'),
    updatedAt: new Date('2026-02-10T08:10:00Z'),
  },
  {
    title: 'Next.js App Router 환경에서의 Hydration 에러 해결',
    author: '우재현',
    tags: ['Next.js', 'React', 'Troubleshooting'],
    content: generateTiptapJSON(
      'Text content did not match. Server vs Client',
      'Tiptap 에디터와 같은 클라이언트 중심 라이브러리를 SSR 환경에서 렌더링할 때 발생하는 Hydration 불일치 문제를 해결하는 팁입니다.',
    ),
    createdAt: new Date('2026-02-15T13:50:00Z'),
    updatedAt: new Date('2026-02-16T11:20:00Z'),
  },
  {
    title: '[일상] 흑백요리사2 출시를 기다리며... 개발자의 휴식',
    author: '우재현',
    tags: ['Life', '흑백요리사2', 'Gaming'],
    content: generateTiptapJSON(
      '코딩을 잠시 멈추고',
      '기다리고 있던 흑백요리사2가 곧 나옵니다. 사이드 프로젝트와 블로그 개발로 바빴던 최근 일상을 돌아보며 머리를 식히는 시간을 가졌습니다.',
    ),
    createdAt: new Date('2026-02-20T22:15:00Z'),
    updatedAt: new Date('2026-02-20T22:15:00Z'),
  },
  {
    title: 'Tiptap 에디터에 highlight.js 완벽하게 적용하는 방법',
    author: '우재현',
    tags: ['Tiptap', 'React', 'Frontend'],
    content: generateTiptapJSON(
      '코드 블록에 생명 불어넣기',
      '블로그 에디터를 개발하며 CodeBlockLowlight 확장과 Tailwind Typography 간의 CSS 충돌을 해결하고 문법 강조를 구현했습니다.',
    ),
    createdAt: new Date('2026-02-24T10:05:00Z'),
    updatedAt: new Date('2026-02-24T14:30:00Z'),
  },
  {
    title: 'Web Audio API를 활용한 제너레이티브 로파이(Lofi) 플레이어 만들기',
    author: '우재현',
    tags: ['Web Audio', 'Canvas', 'React'],
    content: generateTiptapJSON(
      '브라우저에서 음악을 합성하다',
      'HTML5 Canvas와 Web Audio API의 OscillatorNode를 활용하여 블로그 배경음악을 직접 합성하고, 턴테이블 애니메이션을 구현했습니다.',
    ),
    createdAt: new Date('2026-02-26T09:00:00Z'),
    updatedAt: new Date('2026-02-26T09:00:00Z'),
  },
];

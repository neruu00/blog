/**
 * @file TechStackPoster.tsx
 * @description 홈 포스터 영역의 기술 스택 세로 무한 루프.
 *              CSS 키프레임(globals.css의 .animate-marquee-y)만 쓰는 서버 컴포넌트 —
 *              목록을 두 번 렌더하고 -50%까지 이동시켜 이음새 없이 반복한다.
 */

const TECH_STACK = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Tailwind CSS',
  'Supabase',
  'Zustand',
  'Java',
  'Python',
  'Git',
];

export default function TechStackPoster() {
  return (
    <div className="relative h-64 overflow-hidden border border-gray-200 bg-gray-100 select-none">
      <div className="animate-marquee-y flex flex-col">
        {[false, true].map((isClone) => (
          <ul
            key={String(isClone)}
            aria-hidden={isClone || undefined}
            className="flex flex-col items-center"
          >
            {TECH_STACK.map((tech) => (
              <li
                key={tech}
                className="py-2 text-center text-sm font-black tracking-widest text-gray-900 uppercase"
              >
                {tech}
              </li>
            ))}
          </ul>
        ))}
      </div>

      {/* 위아래 페이드 — 잘리는 텍스트를 부드럽게 가린다 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-gray-100 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-gray-100 to-transparent" />
    </div>
  );
}

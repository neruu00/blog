/**
 * @file tags.ts
 * @description 게시글 태그 사전.
 */

export const POSTS_PER_PAGE = 10;

/**
 * 게시글 태그 사전. 여기 없는 태그는 입력할 수 없다(TagInputField가 정확히 일치할 때만 추가).
 * 순서가 곧 `/posts`의 필터 칩 순서다 — 언어 → 프레임워크 → 프론트 주제 → 공통 → 그 외.
 *
 * `keywords`는 자동완성 검색용이라 **소문자로** 쓴다(입력값을 소문자로 낮춰 비교한다).
 */
export const TAG_DICTIONARY = [
  { name: 'Javascript', keywords: ['자바스크립트', 'js'] },
  { name: 'Typescript', keywords: ['타입스크립트', 'ts'] },
  { name: 'React', keywords: ['리액트'] },
  { name: 'Next.js', keywords: ['넥스트', 'nextjs'] },
  { name: 'CSS', keywords: ['스타일', '스타일링', 'tailwind', '테일윈드'] },
  { name: 'Browser', keywords: ['브라우저', '렌더링', 'dom', '이벤트루프'] },
  { name: 'Performance', keywords: ['성능', '최적화', 'perf', 'lighthouse'] },
  { name: 'Testing', keywords: ['테스트', '테스팅', 'jest', 'vitest'] },
  { name: 'Network', keywords: ['네트워크', '통신', 'http', 'api'] },
  {
    name: 'Security',
    keywords: ['보안', 'xss', 'csrf', 'csp', 'cors', '쿠키', '인증', '인가', 'oauth', 'jwt'],
  },
  { name: 'Database', keywords: ['데이터베이스', 'db', 'sql'] },
  { name: 'Algorithm', keywords: ['알고리즘', '자료구조'] },
  { name: 'Java', keywords: ['자바'] },
  { name: 'Python', keywords: ['파이썬'] },
  { name: 'etc', keywords: ['기타'] },
];

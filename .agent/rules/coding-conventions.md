# 코딩 컨벤션

## 1. 파일 명명 규칙

| 종류 | 패턴 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase `.tsx` | `PostCard.tsx` |
| 서버 액션 | camelCase `.action.ts` | `post.action.ts` |
| Zod 스키마 | camelCase `.schema.ts` | `post.schema.ts` |
| Zustand 스토어 | `use` + PascalCase `Store.ts` | `useModalStore.ts` |
| 커스텀 훅 | `use` + PascalCase `.ts` | `useOptimisticLike.ts` |
| 타입 정의 | camelCase `.type.ts` | `post.type.ts` |
| 유틸리티 | camelCase `.ts` | `logger.ts` |
| 페이지 | `page.tsx` (Next.js 규칙) | `app/posts/page.tsx` |
| 레이아웃 | `layout.tsx` (Next.js 규칙) | `app/(blog)/layout.tsx` |

---

## 2. 주석 규칙

### 2.1 파일 상단 주석 (필수)

모든 `.ts`, `.tsx` 파일에 파일 설명 주석을 반드시 포함한다.

```typescript
/**
 * @file PostCard.tsx
 * @description 게시글 목록에서 사용되는 카드 컴포넌트.
 *              제목, 요약, 태그, 작성일을 표시한다.
 */
```

### 2.2 함수/컴포넌트 JSDoc

export되는 함수와 컴포넌트에는 JSDoc을 작성한다.

```typescript
/**
 * 게시글 카드 컴포넌트
 * @param post - 게시글 데이터
 * @param index - 목록 내 순서 (애니메이션 딜레이용)
 */
export default function PostCard({ post, index }: PostCardProps) { ... }
```

### 2.3 인라인 주석

- **Why(왜)** 위주로 작성한다. What/How는 코드 자체로 설명.
- 복잡한 비즈니스 로직, 비직관적인 코드, 성능 최적화 의도에 사용.

```typescript
// 낙관적 업데이트: 서버 응답 전에 UI를 먼저 갱신하여 즉각적인 피드백 제공
setLikeCount((prev) => prev + 1);
```

### 2.4 금지 사항

- TODO, FIXME 등의 태그는 반드시 이슈 번호 또는 구체적인 설명과 함께 사용
- 주석 처리된 코드(dead code)는 커밋하지 않음
- `console.log` 대신 `logger` 유틸 사용 (ESLint `no-console` 규칙 적용)

---

## 3. Import 순서 (ESLint 자동 정렬)

```
1. builtin     — Node.js 내장 모듈 (path, fs)
2. external    — npm 패키지 (react, next, zustand)
3. internal    — 프로젝트 내부 (@/...)
4. parent      — 상위 디렉토리 (../)
5. sibling     — 형제 디렉토리 (./)
6. type        — 타입 import (import type { ... })
```

- 그룹 사이에 **빈 줄 필수** (`newlines-between: always`)
- 그룹 내 알파벳순 정렬 (`alphabetize: asc`)
- `@/**` 패턴은 `internal` 그룹에 배치

---

## 4. TypeScript 규칙

- `strict: true` 유지
- `any` 타입 사용 금지 (불가피한 경우 `unknown` + 타입 가드)
- `as` 타입 단언 최소화 → Zod `parse`/`safeParse`로 대체
- 유니온 타입은 `type`으로, 객체 구조는 `interface`로 정의
- 컴포넌트 Props는 `interface`로 정의하고 컴포넌트 바로 위에 선언

```typescript
interface PostCardProps {
  post: Post;
  index: number;
}

export default function PostCard({ post, index }: PostCardProps) { ... }
```

---

## 5. 함수 작성 규칙

- 컴포넌트: `export default function` (function declaration)
- 유틸/헬퍼: `export function` 또는 `export const` (일관성 유지)
- 서버 액션: `export async function` (`'use server'` 파일 내)
- 이벤트 핸들러: `handle` 접두사 (`handleSubmit`, `handleClick`)
- 커스텀 훅: `use` 접두사 (`useOptimisticLike`)

---

## 6. Prettier 설정 (유지)

```json
{
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always"
}
```

---

## 7. Husky + lint-staged

### pre-commit
```bash
npx lint-staged
```

### lint-staged 설정
```json
{
  "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

---

## 8. 하네스 준수 사항 (Harness Compliance)

하네스 엔지니어링 환경에서 AI 에이전트는 다음을 준수해야 한다.

### 8.1 자가 검증 (Self-Verification)
- 모든 작업 완료 후 `.harness/eval/runner.js`를 실행하거나, 해당 문서의 '통과 기준'을 수동으로 체크한다.
- `pnpm lint`를 실행하여 컨벤션 위반 사항이 없는지 확인한다.

### 8.2 변경 이력 기록
- 중요한 아키텍처 변경이나 기능 추가 시 `.harness/history/`에 작업 의도와 설계 결정을 기록한다.
- 작업 완료 후 `walkthrough.md`를 업데이트하여 변경 사항을 요약한다.

### 8.3 컨텍스트 유지
- 작업을 시작하기 전 `AGENTS.md`를 다시 한 번 읽고 본인의 역할과 원칙을 상기한다.
- `.specs/` 디렉토리의 최신 상태를 항상 확인한다.

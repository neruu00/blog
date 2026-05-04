# 기능 스펙

## 1. 게시글 (Posts)

### CRUD
- **작성/수정/삭제**: admin만 가능
- **열람**: 모든 사용자 (비로그인 포함)
- 데이터 형식: Tiptap JSONContent로 DB 저장

### 게시글 상세 페이지
- 사이드 **Table of Contents(TOC)**: heading(h2~h4)을 파싱하여 우측에 고정 네비게이션
  - **SEO 대응**: 에디터 본문의 Heading Shift(# -> h2)를 반영하여 파싱 대상 및 계층(h2: L1, h3: L2, h4: L3) 조정
  - `IntersectionObserver`로 현재 위치 하이라이트
  - 클릭 시 해당 heading으로 스무스 스크롤
  - Tiptap 비동기 렌더링 대기 (Polling 방식으로 DOM 준비 확인)
  - XL(1280px) 이상에서만 표시

### 에디터 (Advanced Tiptap)
- **Heading Shift**: 검색 엔진 최적화를 위해 본문 내 `#` 입력 시 `<h2>`로 자동 변환 (1페이지 1H1 원칙 준수)
- **Advanced Table**: 행/열 개수를 지정하여 테이블을 삽입하고, 테이블 내부에서 행/열을 추가·삭제할 수 있는 관리 도구 제공
- **Export**: 게시글 상세 페이지에서 Markdown 형식으로 콘텐츠 내보내기 지원

### 태그
- 태그 기반 필터링 (URL searchParams)
- `TagInputField` 자동완성 셀렉터로 태그 입력
- 사전 정의 태그: Algorithm, Frontend, Backend, Database, Javascript, Typescript, React, Next.js, Java, Python, etc

---

## 2. 댓글 (Comments)

### 권한
- **작성**: Google 로그인 사용자만
- **삭제**: 본인 댓글 또는 admin

### 구조
- **1단 대댓글** (flat reply): `parent_id`로 연결
- 게시글당 댓글 목록은 생성순 정렬

### 데이터
```typescript
interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userImage: string;
  parentId: string | null;  // null이면 최상위 댓글
  content: string;
  createdAt: Date;
}
```

---

## 3. 좋아요 (Likes)

### 권한
- Google 로그인 사용자만, 게시글당 1회

### 낙관적 업데이트
1. 클릭 즉시 UI 반영 (카운트 ±1, 아이콘 색상 변경)
2. 서버 액션 호출
3. 에러 시 이전 상태로 롤백
4. 성공 시 `invalidateQueries`로 최종 동기화

### API
- `toggleLike(postId)` — 좋아요 토글 (있으면 삭제, 없으면 추가)
- `getLikeStatus(postId)` — `{ hasLiked: boolean, count: number }`

---

## 4. 조회수 (View Count)

### 동작
- 게시글 상세 페이지 진입 시 카운트 +1
- `ViewCounter` 클라이언트 컴포넌트에서 Server Action 호출
- 서버 액션 또는 API Route로 처리

---

## 5. 포트폴리오 (Portfolio)

### 구조
- `/portfolio` 페이지
- 프로필 Hero Section (이름, 역할, 이메일, GitHub, 위치)
- 기술 스택 카드 그리드 (Frontend, Backend & Database, Tools)
- 프로젝트 경험 리스트 (제목, 기간, 설명, 기술 태그, 외부 링크)

### 데이터 관리
- 페이지 파일 상단의 상수 배열(`PROFILE`, `SKILLS`, `PROJECTS`)을 수정하여 내용 갱신

---

## 6. 로깅

### 서버 (logger.ts)
```typescript
const logger = {
  info: (message: string, meta?: Record<string, unknown>) => void,
  warn: (message: string, meta?: Record<string, unknown>) => void,
  error: (message: string, error?: unknown) => void,
};
```
- 구조화된 JSON 로그 출력 (Vercel Logs 검색 가능)
- `no-console` ESLint 규칙과 호환: `console.log` 대신 `logger` 사용

### 클라이언트
- 개발 모드: 모든 레벨 출력
- 프로덕션: error만 출력

---

## 7. Google Analytics 4

- `next/script`로 GA 스크립트 로드 (`afterInteractive` 전략)
- 측정 ID: `G-ZL70EZYFER`
- Vercel Analytics + Speed Insights 병행 운용

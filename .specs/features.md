# 기능 스펙

## 1. 게시글 (Posts)

### CRUD
- **작성/수정/삭제**: admin만 가능
- **열람**: 모든 사용자 (비로그인 포함)
- 데이터 형식: Tiptap JSONContent로 DB 저장

### 게시글 상세 페이지
- 사이드 **Table of Contents(TOC)**: heading(h1~h3)을 파싱하여 우측에 고정 네비게이션
  - `IntersectionObserver`로 현재 위치 하이라이트
  - 클릭 시 해당 heading으로 스무스 스크롤
  - 모바일에서는 숨김 또는 드롭다운으로 축소

### 카테고리/태그
- 태그 기반 필터링 (URL searchParams)
- 카테고리: `tech`, `project`, `portfolio`, `etc`

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
- `getLikeStatus(postId)` — `{ isLiked: boolean, count: number }`

---

## 4. 조회수 (View Count)

### 동작
- 게시글 상세 페이지 진입 시 카운트 +1
- **중복 방지**: 쿠키에 `viewed_posts` 배열 저장, 동일 게시글은 24시간 내 재카운트 방지
- 서버 액션 또는 API Route로 처리

---

## 5. 포트폴리오 (Portfolio)

### 구조
- `/portfolio` 페이지
- 프로젝트 카드 그리드 레이아웃
- 각 카드: 썸네일, 제목, 설명, 기술 스택 태그, 링크

### 링크 방식
- 외부 사이트 링크 (새 탭)
- 또는 iframe 임베드 (모달/페이지 내)

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

- `next/script`로 GA 스크립트 로드 (`afterInteractive`)
- 페이지뷰 자동 추적: `usePathname` + `useSearchParams`
- 커스텀 이벤트: 게시글 조회, 좋아요, 댓글 작성

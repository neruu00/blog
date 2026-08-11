# 기능 스펙

## 1. 게시글 (Posts)

### CRUD
- **작성/수정/삭제**: admin만 가능
- **열람**: 모든 사용자 (비로그인 포함)
- 데이터 형식: Tiptap JSONContent로 DB 저장
- **게시글 목록**: 카테고리별 필터링 및 페이지네이션 지원. 글이 없는 경우 Admin에게만 '새 글 작성' 링크 제공.

### 게시글 상세 페이지
- 사이드 **Table of Contents(TOC)**: heading(h2~h4)을 파싱하여 우측에 고정 네비게이션
  - **SEO 대응**: 에디터 본문의 Heading Shift(# -> h2)를 반영하여 파싱 대상 및 계층(h2: L1, h3: L2, h4: L3) 조정
  - `IntersectionObserver`로 현재 위치 하이라이트
  - 클릭 시 해당 heading으로 스무스 스크롤
  - Tiptap 비동기 렌더링 대기 (MutationObserver 방식으로 DOM 변화 실시간 확인)
  - XL(1280px) 이상에서만 표시

### 에디터 (Advanced Tiptap)
- **Heading Shift**: 검색 엔진 최적화를 위해 본문 내 `#` 입력 시 `<h2>`로 자동 변환 (1페이지 1H1 원칙 준수)
- **Advanced Table**: 행/열 개수를 지정하여 테이블을 삽입하고, 테이블 내부에서 행/열을 추가·삭제할 수 있는 관리 도구 제공
- **Export**: 게시글 상세 페이지에서 Markdown 형식으로 콘텐츠 내보내기 지원 (`DropdownMenu` 프리미티브 활용)
- **TiptapViewer 번들 분리**: `next/dynamic`으로 Lazy Load (ssr: true — SSR은 유지하여 SEO 무영향, Hydration만 지연)

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

### 낙관적 업데이트 (`LikeButton.tsx`)
1. 클릭 즉시 UI 반영 (카운트 ±1, 아이콘 색상 변경)
2. 500ms 디바운스 후 서버 동기화 — 연타 시 마지막 의도만 전송
3. 동기화 중에는 잠금(`isSyncing`), 완료 후 대기분이 있으면 재귀 호출
4. 실패 시 마지막으로 성공한 서버 상태(`syncState`)로 롤백 + 토스트

> 서버는 멱등적으로 동작한다. 중복 insert(`23505`)는 성공으로 간주하고,
> 실제 삭제된 행이 있을 때만 카운트를 감소시킨다.

### API
- `toggleLike(postId, shouldLike)` — 반영할 최종 상태를 명시적으로 전달 (토글 아님)
- `getLikeStatus(postId)` — `{ hasLiked: boolean, count: number }`

---

## 4. 조회수 (View Count)

### 동작
- `ViewCounter` 클라이언트 컴포넌트가 마운트 시 `incrementViewCount` Server Action 호출
- `viewed_posts` 쿠키로 24시간 내 동일 게시글 재카운트 방지
- 화면에는 DB에 저장된 값을 그대로 표시한다. 증가는 렌더 이후에 일어나므로
  최초 조회자에게는 1 낮게 보이지만, 재방문자에게 부풀려 보이는 것보다 정확하다.

> ⚠️ 현재 중복 방지가 클라이언트 쿠키에만 있어 Server Action을 직접 호출하면
> 무제한 증가가 가능하다. 서버측 검증 필요 — `PLAN.md` T-101.

---

## 5. 기술 뉴스 (Tech News)

프론트엔드 관련 RSS를 수집해 한국어 마크다운으로 요약, `tech_news`에 저장한다.

### 수집 소스

| source | 피드 |
|---|---|
| `react` | `react.dev/rss.xml` |
| `nextjs` | `nextjs.org/feed.xml` |
| `typescript` | `devblogs.microsoft.com/typescript/feed/` |
| `chrome` | `developer.chrome.com/static/blog/feed.xml` |
| `tailwindcss` | `tailwindcss.com/feeds/feed.xml` |
| `javascript` | `javascriptweekly.com/rss/` |

### 파이프라인 (`/api/cron/fetch-news`, 매일 00:00 UTC)

1. `Authorization: Bearer $CRON_SECRET` 검증 → 불일치 시 401
2. 날짜 기준 계산 (기본 `DEFAULT_SINCE_DAYS`=2일, `?days=N` / `?since=YYYY-MM-DD`로 재정의)
3. 기존 `original_url` 일괄 조회 (N+1 방지)
4. 피드별 파싱 — 실패는 `feedsFailed`/`errors`에 집계 (조용히 넘기지 않는다)
5. 날짜 필터로 스킵 → **LLM 호출 전에** 걸러 비용 절감
6. 신규 기사만 gpt-4o-mini 요약 후 INSERT, 기사 간 1초 딜레이

### 비용·안정성 가드

- 피드별 timeout 15초 (rss-parser 기본 60초)
- 전체 실행 250초 초과 시 중단하고 `timeout: true` 반환 (Vercel `maxDuration` 300초 대비)
- 429는 지수 백오프 3회 재시도, 크레딧 소진(`exceeded your current quota`)은 즉시 실패
- `?days=N`으로 백필 가능. 중복은 스킵되므로 반복 실행이 안전하다.

### 필수 환경변수

`CRON_SECRET`, `OPENAI_API_KEY` — **Vercel에도 등록해야 한다.** 둘 중 하나라도 없으면
크론이 200 OK를 반환하면서 아무것도 저장하지 않는다.

---

## 6. Google Analytics 4

- `next/script`로 GA 스크립트 로드 (`afterInteractive` 전략)
- 측정 ID: `G-ZL70EZYFER`
- Vercel Analytics + Speed Insights 병행 운용

---

## 7. SEO

| 경로 | 내용 | 갱신 |
|---|---|---|
| `/sitemap.xml` | 정적 경로 + 전체 게시글 + 전체 뉴스 | 1시간 ISR |
| `/robots.txt` | `/write`, `/edit/`, `/api/` 차단 + 사이트맵 링크 | 정적 |
| `/feed.xml` | 자체 RSS 2.0, 최신 20건. 요약은 Tiptap 본문에서 추출 | 1시간 ISR |

- 절대 URL은 `lib/constants/site.ts`의 `SITE_URL` 단일 출처를 사용한다.
- `sitemap.ts`에 `revalidate`가 없으면 빌드 시점에 고정되어 새 글이 재배포 전까지
  반영되지 않는다. 반드시 유지할 것.
- 게시글 상세는 `generateMetadata`로 OpenGraph 메타를 생성한다 (본문 160자 요약).

---

## 8. 에러 처리

| 파일 | 범위 |
|---|---|
| `app/(blog)/error.tsx` | (blog) 그룹 렌더 예외. `reset()` 재시도 + `error.digest` 노출 |
| `app/(blog)/loading.tsx` | Server Component가 Supabase 응답을 기다리는 동안의 스켈레톤 |
| `app/not-found.tsx` | 매칭되지 않는 경로 + `notFound()` 호출 |

Server Action의 반환 규약(`ActionResult<T>`, 예외를 던지지 않음)은 `AGENTS.md` 서버 액션 섹션이 원본이다. 클라이언트는 실패를 토스트로 표시한다.

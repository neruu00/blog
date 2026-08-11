# 개선 계획

> 코드베이스 점검 결과와 후속 작업 백로그
> 최종 갱신: 2026-08-11
>
> 기존 `.specs/.Plan.md`(커밋 `1a88c85`)의 과제를 이 문서로 통합했다.
> 병합된 항목: `T-102`(RLS+JWT), `T-203`(revalidateTag), `T-205`(useActionState),
> `T-206`(Tiptap 정적 HTML), `T-207`(next/image), `T-310`(CVA), `T-403`(동적 OG), `T-408`(포트폴리오).

---

## 📌 결정 로그

향후 작업자(사람/에이전트)가 뒤집지 않도록 결정과 근거를 남긴다.

### D-001. TanStack Query를 댓글·좋아요에 적용하지 않는다 (2026-08-11)

**결정**: 서버 상태 캐싱 목적으로 TanStack Query를 도입하지 않는다.

**근거**:

- 클라이언트 데이터 흐름이 댓글·좋아요 두 곳뿐이고, 둘 다 Server Action + `revalidatePath`로 이미 동작한다.
- 폴링, 무한스크롤, 윈도우 포커스 refetch, 컴포넌트 간 캐시 공유가 전무하다. 라이브러리의 핵심 가치가 발동하지 않는다.
- 댓글의 체감 지연은 React 19 네이티브 `useOptimistic`으로 해결 가능하다. 의존성 없이 같은 결과를 얻는 쪽이 우선한다.
- `LikeButton.tsx:40-80`의 직렬화 로직은 이미 정상 동작한다. 동작하는 코드를 의존성으로 대체하는 것은 이득이 아니다.

**⚠️ 충돌**: `.agent/rules/state-management.md` §3은 TanStack Query를 서버 상태 표준으로 규정하고 낙관적 업데이트 패턴까지 예시로 제공한다. **문서와 실제 구현이 처음부터 어긋나 있었다.** 이 문서를 정리하지 않으면 다음 작업자가 규칙을 따라 다시 도입하게 된다. → `T-301` 참조.

**재검토 조건**: 검색 기능(`T-402`)을 도입할 경우. 검색어별 캐시, `placeholderData: keepPreviousData`, 자동 요청 취소는 RSC나 `useOptimistic`으로 대체하기 번거롭다.

---

## ✅ 완료 (2026-08-11)

뉴스 큐레이션 크론이 43일간 0건을 수집하던 문제를 해결했다.

| 항목 | 파일 |
|---|---|
| 죽은 피드 URL 3개 교체 (react/chrome 404, tailwindcss 500) | `lib/rss.ts` |
| `parseFeed` 예외 은폐 제거 → 호출부에서 `feedsFailed`/`errors` 집계 | `lib/rss.ts`, `api/cron/fetch-news/route.ts` |
| 시간 가드를 도달 가능한 위치(바깥 루프)로 이동 | `api/cron/fetch-news/route.ts` |
| 피드별 timeout 15초 지정 (rss-parser 기본 60초 → 함수 전체 사망 방지) | `lib/rss.ts` |
| `isoDate` 우선 사용 (RSS/Atom 정규화 값) | `lib/rss.ts` |
| 중복 삽입(`23505`)을 실패가 아닌 스킵으로 처리 | `api/cron/fetch-news/route.ts` |
| 60일치 백필 실행 — `tech_news` 3건 → 16건, 실패 0건 | — |

**근본 원인**: `OPENAI_API_KEY`가 Vercel 3개 환경 어디에도 없었다. 여기에 죽은 피드 3개와 실패 은폐가 겹쳐, 크론이 매일 200 OK를 반환하며 아무것도 저장하지 않았다.

---

## 🚨 T-0. 즉시 처리 (배포 차단 중)

- [ ] **T-001** `OPENAI_API_KEY`를 Vercel Production에 등록 — `npx vercel env add OPENAI_API_KEY production`. 없으면 크론이 계속 전건 실패한다.
- [ ] **T-002** 위 "완료" 항목 커밋 + 배포. 현재 워킹트리 미커밋 상태이며, 배포 전까지 프로덕션은 죽은 피드를 계속 긁는다.
- [ ] **T-003** 배포 후 첫 크론(00:00 UTC) 응답에서 `feedsFailed: 0`, `failed: 0` 확인.

---

## 🔒 T-1. 보안 · 데이터 무결성

- [ ] **T-101** **조회수 조작 차단** — `incrementViewCount`(`actions/post.ts:288`)는 인증 없는 public server action이고 중복 방지가 클라이언트 쿠키(`ViewCounter.tsx:42`)에만 있다. 액션을 직접 호출하면 무한 증가한다. IP+postId 기반 서버측 기록 또는 rate limit 필요.
- [ ] **T-102** **RLS 분리** — `lib/supabase.ts:3-6`이 공개 조회부터 관리자 쓰기까지 `service_role` 단일 클라이언트로 처리해 RLS를 전면 bypass한다. 서버 액션 하나의 권한 체크 누락이 곧 DB 전체 노출이다. 공개 읽기를 anon 키 + RLS로 분리하고, 나아가 NextAuth 세션 기반으로 Supabase JWT를 커스텀 발급해 익명 읽기·관리자 쓰기를 **DB 엔진 레벨에서** 통제한다.
- [ ] **T-103** **댓글·좋아요 rate limit** — 로그인만 하면 무제한 작성 가능하다.
- [x] **T-104** `lib/auth.ts:23`의 `as any` 제거 → `as Adapter` — `AGENTS.md`가 스스로 금지한 규칙을 위반 중이다.
- [ ] **T-105** Vercel의 미사용 시크릿 `OTP_SECRET`, `SESSION_SECRET` 정리 — 코드에서 참조 0건.

---

## 🎯 T-2. 정확성 · UX

- [x] **T-201** 조회수가 항상 `+1`로 표시된다(`app/(blog)/posts/[id]/page.tsx:141`). 이미 본 글이라 카운트가 오르지 않는 경우에도 화면엔 +1이 나온다.
- [x] **T-202** `error.tsx` / `not-found.tsx` / `loading.tsx` 부재. 홈에서 Supabase 에러 시 `throw new Error`(`app/(blog)/page.tsx:31`)가 Next 기본 에러 화면으로 직행한다.
- [ ] **T-203** 캐싱 전략 부재. 홈·목록·상세가 매 요청 DB를 직격한다. `revalidate` 또는 `unstable_cache` 미사용. 나아가 `revalidatePath`(경로 전체 무효화) 대신 `revalidateTag` 기반의 세분화된 무효화로 전환하면 T-204의 과잉 재생성도 함께 줄어든다.
- [ ] **T-204** 댓글 작성 시 `revalidatePath`로 페이지 RSC 트리 전체가 재생성된다(`actions/comment.ts:89`). 댓글 하나에 `getPost`+`getLikeStatus`+`getComments`+`verifyAdminSession`이 모두 재실행된다. → `useOptimistic` 적용 (D-001 참조).
- [ ] **T-205** 폼 상태를 수동 관리 중이다 — `hooks/usePostSubmit.tsx`, `stores/useEditorStore.ts`의 `isSubmitting` 등. React 19 `useActionState` + `useFormStatus`로 선언적 리팩토링하면 보일러플레이트가 줄고 동시성 안전성이 확보된다.
- [ ] **T-206** **`/posts/[id]` 번들이 First Load JS 500 kB로 전 라우트 중 최대다** (빌드 실측, 페이지 자체 210 kB). Tiptap 런타임 전체가 읽기 전용 페이지에 실린다. 작성/수정 시 `@tiptap/html`의 `generateHTML`로 정적 HTML을 사전 생성해 별도 컬럼에 저장하고, 상세 페이지는 에디터 라이브러리 없이 렌더한다. 초기 로드·SEO 모두 개선된다.
- [ ] **T-207** 게시글 본문 이미지가 `next/image`를 타는지 확인 — `components/editor/extensions/ImageComponent.tsx`. 업로드 시 WebP 변환(`lib/image-converter.ts`)은 이미 있으나 렌더 측 레이지 로딩·`srcSet` 적용 여부는 미확인.

---

## 🧹 T-3. 정리 (죽은 코드)

한 번에 묶으면 약 `-300`줄.

- [x] **T-301** `.agent/rules/state-management.md` §3(TanStack Query) 정리 — D-001 결정 반영. **T-302보다 먼저 처리한다.**
- [ ] **T-302** TanStack Query 제거 검토 — provider + devtools가 마운트돼 있으나 `useQuery`/`useMutation` 호출 0건. **`T-402`(검색) 로드맵 확정 후 결정.** 검색을 넣을 거면 존치, 아니면 제거.
- [x] **T-303** 미사용 의존성 제거 — `@google/generative-ai`(openai로 대체됨), `framer-motion`. 둘 다 import 0건.
- [ ] **T-304** `lib/logger.ts` 94줄 미사용. 전 코드가 `console.error`를 쓴다. 문서 주석은 "이 모듈로만 로그 출력"이라 적혀 있어 의도와 현실이 불일치한다. 채택하거나 삭제하거나 택일.
- [x] **T-305** `hooks/useOptimisticLike.ts` 빈 스텁("Phase 4에서 구현 예정"), `stores/useLikeStore.ts` 사용처 0.
- [x] **T-306** `TAG_DICTIONARY` 중복 정의 — `lib/constants/tags.ts`와 `components/editor/TagInputField.tsx:6`. 한쪽만 고치면 태그 입력과 필터가 어긋난다.
- [x] **T-307** README 드리프트 정리 — 포트폴리오 제거, 기술 뉴스 추가, `CRON_SECRET`/`OPENAI_API_KEY` 환경변수 문서화.
- [ ] **T-308** `.specs/database.md`에 `tech_news` 테이블이 없다. `original_url`의 UNIQUE 제약 여부가 불명확하다.
- [ ] **T-310** 디자인 시스템화 — `Modal`, `ToastContainer`는 분리됐으나 버튼·인풋 다수가 인라인 스타일이다. `cn()`(`lib/utils.ts`)이 이미 있으므로 CVA를 얹어 `Button`/`Input`/`Badge`를 `components/ui/`로 원시화한다.
- [ ] **T-309** 테스트 0건. `.harness/eval/runner.js`는 tsc/lint/build만 검사해 로직 회귀를 못 잡는다. 최소한 `LikeButton` 동기화와 이미지 롤백(`actions/post.ts:169-203`)은 커버가 필요하다.

---

## 🚀 T-4. 신규 기능 (임팩트 순)

- [x] **T-401** `sitemap.ts` + `robots.ts` — 1시간 ISR. 검증: 27 URL(정적 3 + 게시글 8 + 뉴스 16).
- [ ] **T-402** **검색** — 글 수가 적으면 `title ilike`로 시작, 늘어나면 `to_tsvector` + GIN. **D-001/T-302의 선행 결정 항목.**
- [ ] **T-403** 동적 OG 이미지 — `next/og`의 `ImageResponse`로 게시글 제목·태그를 조합한 썸네일을 자동 생성한다. 링크 공유 시 카드 노출.
- [ ] **T-408** 포트폴리오 — 기존 계획에는 "컴포넌트 하드코딩된 포트폴리오를 Supabase로 옮겨 CMS화"가 있었으나, **현재 포트폴리오 라우트 자체가 존재하지 않는다**(README 드리프트의 원인). 신규 구축인지 폐기인지 결정 필요.
- [x] **T-404** 자체 RSS 피드(`/feed.xml`) — 최신 20건, 1시간 ISR. 검증: `rss-parser`로 파싱 성공(8건).
- [ ] **T-405** 다크 모드 — 토큰이 이미 `app/globals.css`의 `@theme`에 정의돼 있다.
- [ ] **T-406** 이전/다음 글, 태그 기반 관련 글.
- [ ] **T-407** 뉴스 요약 품질 — RSS `description`만 LLM에 투입한다(`lib/rss.ts:68`, 1500자 컷). 원문 본문을 읽지 않아 프롬프트가 요구하는 "코드 예시 / 마이그레이션 가이드" 섹션이 자주 빈다. 본문 fetch를 추가하거나 해당 섹션을 프롬프트에서 제거한다.

---

## ❓ 미해결 질문

1. **검색(T-402)을 로드맵에 넣는가?** → T-302(TanStack Query 제거 여부)가 여기에 종속된다.
2. **Vercel 플랜은?** `api/cron/fetch-news/route.ts`의 `maxDuration = 300`은 주석대로 Pro 기준이다. Hobby라면 실제 상한 확인이 필요하다.
3. **`lib/logger.ts`를 채택할 것인가 삭제할 것인가?** (T-304)

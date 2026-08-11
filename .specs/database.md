# 데이터베이스 스펙 (Supabase / PostgreSQL)

## 1. 테이블 구조

### posts (기존 + 컬럼 추가)

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PK |
| `title` | TEXT | — | 게시글 제목 |
| `content` | JSONB | — | Tiptap JSONContent |
| `tags` | TEXT[] | `{}` | 태그 배열 |
| `author` | TEXT | `'admin'` | 작성자 |
| `category` | TEXT | `'tech'` | 카테고리 (신규) |
| `view_count` | INTEGER | `0` | 조회수 (신규) |
| `like_count` | INTEGER | `0` | 좋아요 수 (신규, 비정규화) |
| `created_at` | TIMESTAMPTZ | `now()` | 생성일 |
| `updated_at` | TIMESTAMPTZ | `now()` | 수정일 (신규) |

### comments (신규)

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PK |
| `post_id` | UUID | — | FK → posts(id) ON DELETE CASCADE |
| `user_id` | UUID | — | FK → users(id) ON DELETE CASCADE |
| `parent_id` | UUID | `NULL` | FK → comments(id) ON DELETE CASCADE (대댓글) |
| `content` | TEXT | — | 댓글 내용 |
| `created_at` | TIMESTAMPTZ | `now()` | 생성일 |

### likes (신규)

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PK |
| `post_id` | UUID | — | FK → posts(id) ON DELETE CASCADE |
| `user_id` | UUID | — | FK → users(id) ON DELETE CASCADE |
| `created_at` | TIMESTAMPTZ | `now()` | 생성일 |

**UNIQUE 제약**: `(post_id, user_id)` — 유저당 게시글당 1회 좋아요

### images (기존 유지)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | UUID | PK |
| `url` | TEXT | 이미지 Public URL |
| `post_id` | UUID | FK → posts(id) |
| `is_used` | BOOLEAN | 사용 중 여부 |
| `created_at` | TIMESTAMPTZ | 업로드 시간 |

### tech_news (뉴스 큐레이션)

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PK |
| `title` | TEXT | — | 기사 원제 |
| `original_url` | TEXT | — | 원문 URL |
| `content` | TEXT | — | LLM이 생성한 마크다운 요약 |
| `source` | TEXT | — | 피드 소스 (`react`, `nextjs`, `typescript`, `chrome`, `tailwindcss`, `javascript`) |
| `published_at` | TIMESTAMPTZ | — | 원문 발행일 (RSS `isoDate`/`pubDate`) |
| `created_at` | TIMESTAMPTZ | `now()` | 수집 시간 |

**UNIQUE 제약 권장**: `original_url` — 크론 재실행/백필 시 중복 삽입 방지.
`/api/cron/fetch-news`가 애플리케이션 레벨에서도 중복을 거르지만, 그 체크는
`published_at >= sinceDate` 윈도우 안에서만 동작하므로 DB 제약이 최종 방어선이다.
라우트는 제약 유무와 무관하게 동작한다 — `23505`를 실패가 아닌 스킵으로 처리한다.

### users, accounts, sessions (Auth.js 자동 생성)
Auth.js의 Supabase Adapter가 자동으로 생성/관리하는 테이블.

---

## 2. 마이그레이션

**SQL의 원본은 `supabase/migrations/`다.** 이 문서는 읽기용 요약이며, 스키마를 바꿀 때는 저 디렉토리에 새 마이그레이션 파일을 추가하고 라이브 DB에 실행한 뒤 이 문서의 표를 함께 갱신한다.

- `20260811000000_baseline.sql` — 라이브 DB에 **적용된** 전체 스키마 (테이블 + 인덱스 + RPC 함수)
- `20260811000001_tech_news_unique_url.sql` — ⚠️ **미적용 대기** — 중복 행 정리 + `original_url` UNIQUE 인덱스 (`PLAN.md` T-308). 적용 후 파일 헤더의 상태 주석을 갱신할 것

## 3. RPC 함수

서버 액션이 `supabase.rpc()`로 호출하는 DB 함수. 정의는 baseline 마이그레이션 참조.

| 함수 | 인자 | 호출처 | 역할 |
|---|---|---|---|
| `increment_view_count` | `post_id` | `actions/post.ts` | `posts.view_count` +1 |
| `increment_like_count` | `target_post_id` | `actions/like.ts` | `posts.like_count` +1 |
| `decrement_like_count` | `target_post_id` | `actions/like.ts` | `posts.like_count` −1 (0 미만 방지) |

---

## 4. RLS (Row Level Security)

RLS 정책은 없다. 서버가 `service_role` 키로 접근해 RLS를 전면 bypass하므로 권한 통제는 전적으로 서버 액션 코드에 있다. 작업 시 주의사항은 `AGENTS.md` "반드시 알아야 할 것" 1번, 분리 계획은 `PLAN.md` T-102 참조.

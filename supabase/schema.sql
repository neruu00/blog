-- =============================================================================
-- 스키마 원본 — 라이브 Supabase DB의 목표 상태
-- =============================================================================
-- 이 파일이 스키마의 원본이다. 전체가 idempotent 하므로 통째로 다시 실행해도
-- 안전하다. 스키마를 바꿀 때는 이 파일을 수정하고, 라이브 DB(Supabase SQL
-- Editor)에 해당 구문을 실행한 뒤 커밋한다.
-- (cushion `blog/database.md` 는 읽기용 요약이며, 컬럼 변경 시 함께 갱신한다)
--
-- ⚠️ 라이브 DB 미적용분이 두 개 있다 — "tech_news 중복 정리 + original_url UNIQUE"
--    블록과 "좋아요 기능 제거" DROP 블록. 나머지는 모두 적용된 상태다.
--    각각 실행 후 해당 블록의 ⚠️ 주석을 지울 것.
--
-- 주의:
--  * posts / images 의 CREATE 문과 RPC 함수 본문은 마이그레이션 기록이 없던
--    시기의 것을 컬럼 문서와 호출부 코드로부터 재구성했다. 라이브 DB와의
--    drift 가 의심되면 라이브 정의가 우선이다.
--  * users 참조는 Auth.js Supabase Adapter 가 관리하는 next_auth 스키마의
--    users 테이블을 가리킨다.
-- =============================================================================

-- ── posts ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  content    JSONB NOT NULL,           -- Tiptap JSONContent
  tags       TEXT[] DEFAULT '{}',
  author     TEXT DEFAULT 'admin',
  category   TEXT DEFAULT 'tech',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── images (업로드 생명주기: is_used=false → 게시글 연결 → 24h 후 고아 청소) ──
CREATE TABLE IF NOT EXISTS images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url        TEXT NOT NULL,
  post_id    UUID REFERENCES posts(id),
  is_used    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── comments (1단 대댓글: parent_id) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES comments(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── tech_news (뉴스 큐레이션: RSS 수집 + LLM 요약) ───────────────────────────
CREATE TABLE IF NOT EXISTS tech_news (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  original_url TEXT NOT NULL,
  content      TEXT NOT NULL,          -- 마크다운 요약
  source       TEXT NOT NULL,          -- react | nextjs | typescript | chrome | tailwindcss | javascript
  published_at TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 인덱스 ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_comments_post_id       ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_tech_news_published_at ON tech_news(published_at DESC);

-- ── tech_news 중복 정리 + original_url UNIQUE (cushion blog/PLAN.md T-308) ───
-- ⚠️ 이 블록만 라이브 DB 미적용이다. Supabase SQL Editor에서 실행 후 이 주석 삭제.
--
-- 크론 재실행/백필 시 중복 수집의 최종 방어선이다. fetch-news 라우트의
-- 애플리케이션 레벨 중복 체크는 published_at >= sinceDate 윈도우 안에서만
-- 동작하므로, 윈도우 밖 중복은 이 인덱스만 막을 수 있다.
-- 라우트는 인덱스 유무와 무관하게 동작한다 (23505를 스킵 처리).

-- UNIQUE 인덱스 생성 전에 기존 중복 행 정리 (가장 먼저 수집된 행만 유지)
DELETE FROM tech_news a
USING tech_news b
WHERE a.original_url = b.original_url
  AND a.created_at > b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tech_news_original_url ON tech_news(original_url);

-- ── RPC 함수 (서버 액션이 supabase.rpc()로 호출) ─────────────────────────────
-- 본문은 호출부로부터 재구성. 라이브 정의와 다르면 라이브가 우선.

-- actions/post.ts: incrementViewCount
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void AS $$
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
$$ LANGUAGE sql;

-- ── 좋아요 기능 제거 (2026-08-20, cushion blog/PLAN.md D-004) ─────────────────
-- ⚠️ 라이브 DB에 아래 DROP 미적용. Supabase SQL Editor에서 실행 후 이 블록 삭제.
DROP FUNCTION IF EXISTS increment_like_count(UUID);
DROP FUNCTION IF EXISTS decrement_like_count(UUID);
DROP TABLE IF EXISTS likes;
ALTER TABLE posts DROP COLUMN IF EXISTS like_count;

-- =============================================================================
-- Baseline: 라이브 Supabase DB에 이미 적용된 스키마의 기록
-- =============================================================================
-- 이 파일이 스키마의 원본이다. 스키마를 바꿀 때는 이 디렉토리에 새 마이그레이션
-- 파일을 추가하고, 라이브 DB(Supabase SQL Editor)에 직접 실행한 뒤 커밋한다.
-- (.specs/database.md 는 읽기용 요약이며, 컬럼 변경 시 함께 갱신한다)
--
-- 주의:
--  * posts / images 의 CREATE 문과 RPC 함수 본문은 마이그레이션 기록이 없던
--    시기의 것을 컬럼 문서와 호출부 코드로부터 재구성했다. 라이브 DB와의
--    drift 가 의심되면 라이브 정의가 우선이다.
--  * users 참조는 Auth.js Supabase Adapter 가 관리하는 next_auth 스키마의
--    users 테이블을 가리킨다.
--  * idx_tech_news_original_url 은 아직 라이브 DB에 미적용이다 (PLAN.md T-308).
--    fetch-news 라우트는 이 인덱스 없이도 동작한다 (23505를 스킵 처리).
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
  like_count INTEGER DEFAULT 0,        -- 비정규화 카운트 (RPC로 증감)
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

-- ── likes (유저당 게시글당 1회) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
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
CREATE INDEX IF NOT EXISTS idx_likes_post_id          ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id          ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_tech_news_published_at ON tech_news(published_at DESC);

-- 크론 재실행/백필 중복 방지 최종 방어선. ⚠️ 라이브 DB 미적용 (PLAN.md T-308)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tech_news_original_url ON tech_news(original_url);

-- ── RPC 함수 (서버 액션이 supabase.rpc()로 호출) ─────────────────────────────
-- 본문은 호출부로부터 재구성. 라이브 정의와 다르면 라이브가 우선.

-- actions/post.ts: incrementViewCount
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void AS $$
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
$$ LANGUAGE sql;

-- actions/like.ts: toggleLike (좋아요 추가 성공 시)
CREATE OR REPLACE FUNCTION increment_like_count(target_post_id UUID)
RETURNS void AS $$
  UPDATE posts SET like_count = like_count + 1 WHERE id = target_post_id;
$$ LANGUAGE sql;

-- actions/like.ts: toggleLike (좋아요 행이 실제로 삭제된 경우에만)
CREATE OR REPLACE FUNCTION decrement_like_count(target_post_id UUID)
RETURNS void AS $$
  UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = target_post_id;
$$ LANGUAGE sql;

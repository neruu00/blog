-- 라이브 Supabase DB의 목표 스키마. 전체가 idempotent라 통째로 다시 실행해도 안전하다.
-- 스키마를 바꿀 때는 이 파일을 고치고, Supabase SQL Editor에서 해당 구문을 실행한 뒤 커밋한다.
--
-- ⚠️ 라이브 DB 미적용 블록이 두 개 있다: "tech_news 중복 정리 + original_url UNIQUE"와
--    "좋아요 기능 제거" DROP. 실행한 뒤 해당 블록의 ⚠️ 주석을 지운다.
--
-- posts·images의 CREATE 문과 RPC 본문은 호출부 코드에서 재구성한 것이라,
-- 라이브 정의와 다르면 라이브가 우선이다.
-- users는 Auth.js Supabase Adapter가 관리하는 next_auth.users를 가리킨다.

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

-- images: is_used=false로 시작해 게시글 저장 시 연결되고, 24시간 넘게 연결되지 않으면 크론이 지운다.
CREATE TABLE IF NOT EXISTS images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url        TEXT NOT NULL,
  post_id    UUID REFERENCES posts(id),
  is_used    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- comments: parent_id로 1단 대댓글을 만든다.
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES comments(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tech_news (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  original_url TEXT NOT NULL,
  content      TEXT NOT NULL,          -- 마크다운 요약
  source       TEXT NOT NULL,          -- react | nextjs | typescript | chrome | tailwindcss | javascript
  published_at TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- series: 글 작성 화면에서 글을 저장할 때 만들고, 속한 글이 없어지면 actions/post.ts가 지운다.
-- 시리즈 안 순서는 series_order → created_at 순으로 정한다.
CREATE TABLE IF NOT EXISTS series (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS series_id    UUID REFERENCES series(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS series_order INTEGER;

CREATE INDEX IF NOT EXISTS idx_posts_series_id ON posts(series_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id       ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_tech_news_published_at ON tech_news(published_at DESC);

-- tech_news 중복 정리 + original_url UNIQUE
-- ⚠️ 라이브 DB 미적용. Supabase SQL Editor에서 실행한 뒤 이 주석을 지운다.
--
-- fetch-news의 중복 검사는 published_at >= sinceDate 범위 안에서만 동작하므로,
-- 백필이나 재실행으로 생기는 범위 밖 중복은 이 인덱스만 막을 수 있다.
-- 라우트는 23505를 스킵으로 처리해 인덱스 유무와 관계없이 동작한다.

-- UNIQUE 인덱스를 만들기 전에 중복 행을 지우고 가장 먼저 수집된 행만 남긴다.
DELETE FROM tech_news a
USING tech_news b
WHERE a.original_url = b.original_url
  AND a.created_at > b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tech_news_original_url ON tech_news(original_url);

-- RPC: 서버 액션이 supabase.rpc()로 호출한다.

-- actions/post.ts의 incrementViewCount가 호출한다.
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void AS $$
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
$$ LANGUAGE sql;

-- 좋아요 기능 제거
-- ⚠️ 라이브 DB 미적용. Supabase SQL Editor에서 실행한 뒤 이 블록을 지운다.
DROP FUNCTION IF EXISTS increment_like_count(UUID);
DROP FUNCTION IF EXISTS decrement_like_count(UUID);
DROP TABLE IF EXISTS likes;
ALTER TABLE posts DROP COLUMN IF EXISTS like_count;

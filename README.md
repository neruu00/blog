# 개인 블로그

나 혼자 쓰기 위해 만든 심플하고 모던한 개인 블로그 프로젝트

## 🔨기술 스택
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Editor:** Tiptap (Headless Editor)
- **Deployment:** Vercel

## ✨ 주요 기능

### 1. 관리자 전용 OTP 로그인
- `otpauth`를 활용한 TOTP 기반의 2단계 인증 시스템
- Steam 느낌의 6자리 언더라인 입력 필드

### 2. Tiptap 기반 모던 에디터
- **JSON(Abstract Syntax Tree)** 형태로 게시글 컨텐츠 데이터를 구조화 저장

### 3. Server Actions를 활용한 데이터 처리
- `React2Shell`이 해결 됐다고 해서 적용함
- 별도의 API 라우트(`route.ts`) 없이, Next.js의 Server Actions를 활용하여 폼 제출과 동시에 Supabase에 데이터를 Direct Insert하는 직관적인 아키텍처
- `HttpOnly` 쿠키와 비대칭 키 검증을 통한 보안 라우팅 적용

## 📌 마일스톤

- [ ] **게시글 이미지 삽입:** `Supabase Storage`를 활용하여 `Tiptap` 에디터 내에 이미지를 업로드하고 렌더링
- [ ] **전역 BGM 시스템:** Context API를 활용하여 페이지를 이동해도 음악이 끊기지 않는 블로그 배경 음악 플레이어 구현
- [ ] **태그별 게시글:** 특정 태그가 포함된 글만 필터링해서 보여주는 아카이브 페이지
- [ ] **SEO:** Next.js Metadata API와 `sitemap.xml`, `robots.txt` 최적화.

## 📄 라이센스

이 프로젝트는 [MIT License](https://opensource.org/licenses/MIT)를 따릅니다.

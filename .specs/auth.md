# 인증 스펙 (NextAuth v4 + Google OAuth)

## 1. 인증 방식

Google OAuth (next-auth v4) + Supabase Adapter. 세션은 JWT 전략.

## 2. 파일 구성

- `lib/auth.ts` — NextAuth 설정 + 권한 헬퍼
- `app/api/auth/[...nextauth]/route.ts` — NextAuth API Route
- `providers/AuthProvider.tsx` — SessionProvider 래퍼 (클라이언트)
- `types/next-auth.d.ts` — 세션 타입 확장 (`user.id`, `user.isAdmin`)
- `middleware.ts` — `/write`, `/edit` 경로 가드. **서버 액션 호출은 막지 못한다** (`AGENTS.md` 참조)

## 3. 권한 체계

| 역할 | 판별 | 권한 |
|---|---|---|
| 비로그인 | 세션 없음 | 게시글·뉴스 열람, 조회수 |
| 일반 유저 | Google 세션 존재 | + 댓글, 좋아요 |
| Admin | 세션 이메일 === `ADMIN_EMAIL` | + 게시글 CRUD, 이미지 업로드 |

## 4. 권한 헬퍼 (`lib/auth.ts`)

| 함수 | 반환 | 비고 |
|---|---|---|
| `verifyAdminSession()` | `boolean` | **코드 전체가 실제로 쓰는 함수.** 서버 액션 첫 줄에서 호출 |
| `isAdmin()` | `boolean` | `verifyAdminSession`의 실체 |
| `requireAdmin()` / `requireAuth()` | throw | 정의만 있고 호출처 0건 |

모든 서버 액션이 스스로 권한을 검사해야 하는 이유(RLS 부재)는 `AGENTS.md` "반드시 알아야 할 것"이 원본이다.

## 5. 환경 변수

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL` — 목록과 설정 방법은 README 참조.

## 6. 로그인 UI

- `signIn('google')` / `signOut()`
- 사이드 네비 하단과 모바일 헤더의 로그인/프로필 버튼 (`LoginButton`, `ProfileButton`)

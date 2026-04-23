# 인증 스펙 (NextAuth v4 + Google OAuth)

## 1. 인증 방식
Google OAuth (next-auth v4) + Supabase Adapter.

## 2. 파일 구성
- `lib/auth.ts` — NextAuth 설정 + 헬퍼 (isAdmin, requireAdmin, requireAuth, verifyAdminSession)
- `app/api/auth/[...nextauth]/route.ts` — NextAuth API Route
- `providers/AuthProvider.tsx` — SessionProvider 래퍼 (클라이언트)
- `types/next-auth.d.ts` — NextAuth 타입 확장 (isAdmin 필드)

## 3. 권한 체계

| 역할 | 판별 | 권한 |
|---|---|---|
| 비로그인 | 세션 없음 | 게시글 열람, 조회수 |
| 일반 유저 | Google 세션 존재 | + 댓글, 좋아요 |
| Admin | 세션 이메일 === `ADMIN_EMAIL` | + 게시글 CRUD |

## 4. Admin 헬퍼
```typescript
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error('권한이 없습니다.');
}

export async function requireAuth(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('로그인이 필요합니다.');
}

// 기존 코드 호환용
export async function verifyAdminSession(): Promise<boolean> {
  return isAdmin();
}
```

## 5. 환경 변수
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
ADMIN_EMAIL=dnwogus4260@naver.com
```

## 6. 로그인 UI
- `signIn('google')` / `signOut()` 사용
- 사이드 네비게이션 하단에 로그인/로그아웃 버튼
- 로그인 시 프로필 이미지 + 이름 표시

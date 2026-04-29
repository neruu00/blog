# Server Action 규칙

## 1. 기본 구조

모든 서버 액션은 다음 순서를 따른다:

```
인증 확인 → Zod 검증 → 비즈니스 로직 → 로깅 → 응답
```

```typescript
'use server';

/**
 * @file post.action.ts
 * @description 게시글 CRUD Server Actions
 */

import { requireAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { postSchema } from '@/schemas/post.schema';
import { supabase } from '@/lib/supabase';

import type { ActionResult } from '@/types/action.type';

export async function createPost(formData: FormData): Promise<ActionResult<{ postId: string }>> {
  // 1. 인증 확인
  await requireAdmin();

  // 2. 입력 검증 (Zod)
  const raw = {
    title: formData.get('title'),
    content: formData.get('content'),
    tags: formData.get('tags'),
  };
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // 3. 비즈니스 로직
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([parsed.data])
      .select()
      .single();

    if (error) throw error;

    // 4. 로깅
    logger.info('게시글 생성', { postId: data.id, title: parsed.data.title });

    return { success: true, data: { postId: data.id } };
  } catch (error) {
    logger.error('게시글 생성 실패', error);
    return { success: false, error: '게시글 저장에 실패했습니다.' };
  }
}
```

---

## 2. 통합 반환 타입

```typescript
// types/action.type.ts
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
```

모든 서버 액션은 이 타입을 반환해야 한다.

---

## 3. 핵심 원칙

### 3.1 클로저 줄이기
- 서버 액션 내부에서 외부 스코프 변수를 캡처하지 않는다.
- `bind`로 넘기거나, `FormData`에 포함시킨다.

```typescript
// ❌ 외부 변수 캡처 (클로저 발생)
const postId = params.id;
async function deletePost() {
  'use server';
  await supabase.from('posts').delete().eq('id', postId);
}

// ✅ FormData 또는 인자로 전달
export async function deletePost(postId: string): Promise<ActionResult> {
  await requireAdmin();
  // ...
}
```

### 3.2 인증은 항상 첫 번째
- 인증이 필요한 액션은 로직 실행 전 반드시 `requireAdmin()` 또는 `requireAuth()` 호출
- 인증 실패 시 즉시 에러 반환 또는 redirect

### 3.3 입력은 반드시 Zod로 검증
- `formData.get()` 값을 직접 사용하지 않는다.
- Zod 스키마로 파싱 후 `parsed.data`만 사용한다.

### 3.4 에러 메시지
- 사용자에게는 일반적인 메시지만 반환 (내부 에러 노출 금지)
- 상세 에러는 `logger.error`로 서버 로그에만 기록

### 3.5 revalidation
- 데이터 변경 후 관련 경로를 `revalidatePath`로 갱신
- 필요한 경로만 최소한으로 갱신

---

## 4. 파일 구성

```
src/actions/
├── post.action.ts      # 게시글 CRUD
├── comment.action.ts   # 댓글 CRUD
├── like.action.ts      # 좋아요 토글
└── image.action.ts     # 이미지 업로드
```

하나의 파일에 관련 액션을 모아 관리한다. 도메인별로 분리.

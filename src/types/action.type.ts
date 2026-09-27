/**
 * @file action.type.ts
 * @description 서버 액션의 반환 타입. 서버 액션은 예외를 던지지 않고 이 형태로 결과를 돌려준다.
 */

/** 성공이면 `data`, 실패면 사용자에게 보여 줄 `error` 메시지를 담는다. */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type PostActionResult = ActionResult<{ postId: string }>;

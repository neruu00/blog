/**
 * @file action.type.ts
 * @description Server Action의 통합 반환 타입.
 *              모든 서버 액션은 이 타입을 사용하여 일관된 응답 구조를 유지한다.
 */

/**
 * Server Action 통합 반환 타입
 * - 성공 시: `{ success: true, data?: T }`
 * - 실패 시: `{ success: false, error: string }`
 */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type PostActionResult = ActionResult<{ postId: string }>;

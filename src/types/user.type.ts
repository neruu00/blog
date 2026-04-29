/**
 * @file user.type.ts
 * @description 사용자 관련 타입 정의.
 */

export interface User {
  /** 사용자 고유 ID (Auth.js) */
  id: string;
  /** 사용자 이름 */
  name: string;
  /** 이메일 */
  email: string;
  /** 프로필 이미지 URL */
  image: string | null;
}

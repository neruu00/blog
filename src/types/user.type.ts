/**
 * @file user.type.ts
 * @description 사용자 타입.
 */

export interface User {
  /** Auth.js 사용자 ID */
  id: string;
  name: string;
  email: string;
  image: string | null;
}

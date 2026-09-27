/**
 * @file utils.ts
 * @description Tailwind 클래스 병합 함수 `cn`. 뒤에 오는 클래스가 충돌하는 앞 클래스를 덮는다.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

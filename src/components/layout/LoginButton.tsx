/**
 * @file LoginButton.tsx
 * @description 관리자 로그인 버튼. 방문자가 로그인할 일은 없어서 눈에 띄지 않는 아이콘으로만 둔다.
 */

'use client';

import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';

import Button from '@/components/ui/Button';

export default function LoginButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="관리자 로그인"
      className="text-gray-400"
      onClick={() => signIn('google')}
    >
      <LogIn className="h-4 w-4" />
    </Button>
  );
}

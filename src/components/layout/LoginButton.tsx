'use client';

import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';

import Button from '@/components/ui/Button';

export default function LoginButton() {
  return (
    <Button variant="outline" className="w-full" onClick={() => signIn('google')}>
      <LogIn className="h-4 w-4" />
      Log in
    </Button>
  );
}

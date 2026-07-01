'use client';

import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn('google')}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
    >
      <LogIn className="h-4 w-4" />
      Log in
    </button>
  );
}

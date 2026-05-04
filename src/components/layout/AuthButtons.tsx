'use client';

import { LogIn, LogOut, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthButtons() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col gap-2">
      {session?.user?.isAdmin && (
        <Link
          href="/write"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          <PenSquare className="h-4 w-4" />
          Write
        </Link>
      )}

      {session ? (
        <button
          onClick={() => signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      ) : (
        <button
          onClick={() => signIn('google')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogIn className="h-4 w-4" />
          Log in
        </button>
      )}
    </div>
  );
}

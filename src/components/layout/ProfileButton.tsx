'use client';

import Image from 'next/image';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

import Tooltip from '@/components/ui/Tooltip';

export default function ProfileButton({ session }: { session: Session }) {
  return (
    <Tooltip text="로그아웃" position="top" className="w-full">
      <button
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-500 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
        onClick={() => signOut()}
      >
        <div className="relative size-10 overflow-hidden rounded-full border border-gray-100 bg-gray-50">
          <Image src={session.user.image!} alt={session.user.name!} fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-gray-900">{session.user.name}</p>
          <p className="truncate text-xs text-gray-500">{session.user.email}</p>
        </div>
      </button>
    </Tooltip>
  );
}

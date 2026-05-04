'use client';

import Link from 'next/link';

import { useActiveNav } from '@/hooks/useActiveNav';
import { NAV_ITEMS } from '@/lib/constants/nav';

export default function NavLinks() {
  const isActive = useActiveNav();

  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              active
                ? 'bg-orange-50 text-orange-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </>
  );
}

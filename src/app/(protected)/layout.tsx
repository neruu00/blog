import { redirect } from 'next/navigation';

import { protect } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await protect(() => redirect('/login'));

  return <>{children}</>;
}

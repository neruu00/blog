import { redirect } from 'next/navigation';

import { isAdmin } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) {
    redirect('/'); // 관리자가 아니면 홈으로 리다이렉트
  }
  return <>{children}</>;
}

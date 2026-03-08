import { protect } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await protect(() => redirect('/login'));

  return <>{children}</>;
}

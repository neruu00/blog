import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session) {
    redirect('/login');
  }

  try {
    const decodedSecret = Buffer.from(session.value, 'base64').toString('utf8');
    if (decodedSecret !== process.env.SESSION_SECRET) {
      redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }

  return <>{children}</>;
}

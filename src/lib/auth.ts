import { cookies } from 'next/headers';

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) return false;

    const decodedSecret = Buffer.from(session.value, 'base64').toString('utf8');
    if (decodedSecret !== process.env.SESSION_SECRET) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// 인증 실패 시에만 전달받은 onError 콜백을 실행
export async function protect<T>(onError: () => T | Promise<T>): Promise<T | void> {
  const isValid = await verifyAdminSession();

  if (!isValid) return await onError();
}

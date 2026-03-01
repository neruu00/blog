'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// 관리자 권한(Service Role)으로 DB에 접근하는 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function createPost(formData: FormData) {
  // 1. 🛡️ 보안 검증: 쿠키가 있는지, 값이 내 비밀키와 일치하는지 확인
  const session = (await cookies()).get('admin_session');
  if (!session) {
    return { success: false, error: '권한이 없습니다. (쿠키 없음)' };
  }

  try {
    const decodedSecret = Buffer.from(session.value, 'base64').toString('utf8');
    if (decodedSecret !== process.env.SESSION_SECRET) {
      return { success: false, error: '유효하지 않은 세션입니다.' };
    }
  } catch (e) {
    return { success: false, error: '세션 검증 중 오류가 발생했습니다.' };
  }

  // 2. 폼 데이터 추출
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title || !content) {
    return { success: false, error: '제목과 내용을 모두 입력해주세요.' };
  }

  // 3. Supabase에 데이터 삽입
  const { error } = await supabase.from('posts').insert([{ title, content }]);

  if (error) {
    console.error('DB 저장 에러:', error);
    return { success: false, error: '게시글 저장에 실패했습니다.' };
  }

  // 4. 메인 페이지 캐시 날리고 새로고침되도록 설정
  revalidatePath('/');

  return { success: true };
}

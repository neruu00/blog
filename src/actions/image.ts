'use server';

/**
 * @file image.ts
 * @description 에디터 이미지 업로드 서버 액션.
 *              업로드한 이미지는 is_used = false로 기록되고, 게시글에 연결되지 않은 채 24시간이 지나면 정리 크론이 삭제한다.
 */

import { isAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function uploadImage(formData: FormData) {
  if (!(await isAdmin())) return { success: false, error: '관리자 권한이 필요합니다.' };

  const file = formData.get('file') as File;
  if (!file) return { success: false, error: '파일이 없습니다.' };

  // 클라이언트에서 WebP로 변환해 올리므로 다른 형식은 거부한다
  if (file.type !== 'image/webp') {
    return { success: false, error: 'WebP 형식의 이미지만 업로드 가능합니다.' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: storageError } = await supabase.storage.from('images').upload(fileName, file);

    if (storageError) throw storageError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(fileName);

    const { error: dbError } = await supabase.from('images').insert([{ url: publicUrl }]);

    if (dbError) throw dbError;

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    return { success: false, error: '이미지 업로드 중 오류가 발생했습니다.' };
  }
}

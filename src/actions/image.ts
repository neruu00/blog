'use server';

import { supabase } from '@/lib/supabase';

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { success: false, error: '파일이 없습니다.' };

  try {
    // 1. Storage에 저장할 고유 파일명 생성
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // 2. Storage 버킷에 업로드
    const { error: storageError } = await supabase.storage.from('images').upload(fileName, file);

    if (storageError) throw storageError;

    // 3. Public URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(fileName);

    // 4. DB 테이블에 정보 기록 (is_used는 기본값 false)
    const { error: dbError } = await supabase.from('images').insert([{ url: publicUrl }]);

    if (dbError) throw dbError;

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    return { success: false, error: '이미지 업로드 중 오류가 발생했습니다.' };
  }
}

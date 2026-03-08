import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // 항상 동적으로 실행되도록 강제

export async function GET(req: Request) {
  // 보안: Vercel Cron에서 보낸 요청인지 헤더 확인 (Vercel 설정 시 제공됨)
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. 24시간 이전 시간 계산
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // 2. 24시간이 지났는데 아직도 is_used가 false인 이미지 찾기
    const { data: orphanImages, error: fetchError } = await supabase
      .from('images')
      .select('id, url')
      .eq('is_used', false)
      .lte('created_at', yesterday.toISOString());

    if (fetchError) throw fetchError;
    if (!orphanImages || orphanImages.length === 0) {
      return NextResponse.json({ message: '청소할 이미지가 없습니다.' });
    }

    // 3. Storage에서 파일 삭제 (URL에서 파일명만 추출)
    const fileNames = orphanImages.map((img) => img.url.split('/').pop()!);
    const { error: storageError } = await supabase.storage.from('images').remove(fileNames);

    if (storageError) throw storageError;

    // 4. DB 테이블에서 레코드 삭제
    const idsToDelete = orphanImages.map((img) => img.id);
    await supabase.from('images').delete().in('id', idsToDelete);

    return NextResponse.json({
      message: `성공적으로 ${orphanImages.length}개의 고아 이미지를 삭제했습니다.`,
    });
  } catch (error) {
    console.error('크론 작업 실패:', error);
    return NextResponse.json({ error: '청소 실패' }, { status: 500 });
  }
}

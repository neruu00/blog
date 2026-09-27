/**
 * @file supabase.ts
 * @description 서버 전용 Supabase 클라이언트. service_role 키라 RLS를 거치지 않으므로
 *              이 클라이언트로 쓰기를 하는 서버 액션은 권한을 직접 확인해야 한다.
 */

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

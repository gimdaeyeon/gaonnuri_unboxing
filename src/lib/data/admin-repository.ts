// 관리자 전용 데이터 접근 — /admin(AdminPage)에서만 쓴다.
// 공개 리포지토리와 다른 점:
//   1. 삭제된 행(is_del = true)도 그대로 읽는다 — 복원이 관리자 페이지의 핵심이라서.
//   2. is_del을 양방향으로 쓴다. 기도제목을 내리는 건 관리자만 하는 일이라
//      쓰기는 전부 여기 모여 있다(사용자 화면에는 삭제가 없다).
// 입장 게이트(env 비밀번호)는 AdminPage 몫이다.
// 행별 password는 관리자에게도 보여줄 이유가 없으므로 여기서도 select하지 않는다.

import { supabase } from '@/lib/supabase/client';
import type { PrayerRequest } from '@/lib/types';
import { fromRow, PUBLIC_COLUMNS, type PublicRow } from './supabase-repository';

export interface AdminPrayer extends PrayerRequest {
  isDeleted: boolean;
}

type AdminRow = PublicRow & { is_del: boolean };

export const adminRepository = {
  async getAll(): Promise<AdminPrayer[]> {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select(`${PUBLIC_COLUMNS}, is_del`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as AdminRow[]).map((row) => ({ ...fromRow(row), isDeleted: row.is_del }));
  },

  // 화면에서는 '숨기기' — 행을 지우지 않고 표시만 세운다. 잘못 눌러도 restore로 되돌아온다.
  softDelete: (id: string) => setDeleted(id, true),

  // 화면에서는 '다시 보이기'.
  restore: (id: string) => setDeleted(id, false),
};

// 이미 그 상태인 행은 match 조건에 걸리지 않아 아무 일도 일어나지 않는다(멱등).
async function setDeleted(id: string, next: boolean): Promise<void> {
  const { error } = await supabase
    .from('prayer_requests')
    .update({ is_del: next, updated_at: new Date().toISOString() })
    .eq('id', id)
    .match({ is_del: !next });
  if (error) throw error;
}

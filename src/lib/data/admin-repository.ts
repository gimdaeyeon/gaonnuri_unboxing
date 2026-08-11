// 관리자 전용 데이터 접근 — /admin(AdminPage)에서만 쓴다.
// 공개 리포지토리와 다른 점: 삭제된 행(is_del = true)도 그대로 읽는다 —
// 복원이 관리자 페이지의 핵심이라서. 입장 게이트(env 비밀번호)는 AdminPage 몫이다.
// 행별 password는 관리자에게도 보여줄 이유가 없으므로 여기서도 select하지 않는다.

import { supabase } from '@/lib/supabase/client';
import type { PrayerRequest } from '@/lib/types';
import { fromRow, PUBLIC_COLUMNS, type PublicRow } from './supabase-repository';
import { prayerRepository } from './prayer-repository';

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

  // 삭제는 사용자 쪽 소프트 삭제와 완전히 같은 동작이라 그대로 쓴다.
  softDelete: (id: string) => prayerRepository.softDelete(id),

  async restore(id: string): Promise<void> {
    // 삭제 표시를 되돌린다. 이미 살아있는 행이면 조건에 걸리지 않아 아무 일도 없다.
    const { error } = await supabase
      .from('prayer_requests')
      .update({ is_del: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .match({ is_del: true });
    if (error) throw error;
  },
};

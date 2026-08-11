// Supabase 구현 — prayer_requests 테이블.
// 컬럼(snake_case): id, author_name, cohort, is_anonymous, content, pray_count,
//                   password, is_del, created_at, updated_at
// 보안 수준: 비밀번호 평문, 누구나 읽기/쓰기 — 교회 내부용.
// password는 절대 목록/단건 조회 select에 포함하지 않는다. 검증은 verifyPassword로만.
// 삭제는 소프트 삭제(is_del = true)이고, 세우고 내리는 쪽은 관리자 화면뿐이다
// (admin-repository.ts). 여기는 읽는 쪽만 책임진다 — 새 조회를 추가할 땐 반드시
// NOT_DELETED를 함께 걸 것. 빠뜨리면 내린 기도제목이 목록·검색·수정 화면에 되살아난다.

import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import type { PrayerInput, PrayerRequest } from '@/lib/types';
import type { PrayerRepository } from './prayer-repository';

// password를 제외한 공개 컬럼 목록 — 모든 조회에 이 상수를 사용한다.
// (admin-repository도 이 상수와 fromRow를 공유한다.)
export const PUBLIC_COLUMNS =
  'id, author_name, cohort, is_anonymous, content, pray_count, created_at, updated_at';

// 살아있는 행만 읽는다는 조건. `.match(NOT_DELETED)` 형태로 모든 조회에 붙인다.
const NOT_DELETED = { is_del: false } as const;

// is_del은 읽기 모델에 노출하지 않는다 — 어차피 false인 행만 읽으므로 화면에서
// 판단할 일이 없고, 그래서 PrayerRequest에도 대응 필드를 두지 않았다.
export type PublicRow = Omit<Tables<'prayer_requests'>, 'password' | 'is_del'>;

export function fromRow(row: PublicRow): PrayerRequest {
  return {
    id: row.id,
    authorName: row.author_name,
    cohort: row.cohort,
    isAnonymous: row.is_anonymous,
    content: row.content,
    prayCount: row.pray_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeInput(input: PrayerInput): PrayerInput {
  return {
    ...input,
    authorName: input.authorName.trim(),
    cohort: input.cohort.trim(),
    content: input.content.trim(),
  };
}

export const supabasePrayerRepository: PrayerRepository = {
  async getAll() {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select(PUBLIC_COLUMNS)
      .match(NOT_DELETED)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as PublicRow[]).map(fromRow);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select(PUBLIC_COLUMNS)
      .eq('id', id)
      .match(NOT_DELETED)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as PublicRow) : null;
  },

  async findByAuthor(cohort, name) {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select(PUBLIC_COLUMNS)
      .eq('cohort', cohort.trim())
      .ilike('author_name', name.trim())
      .match(NOT_DELETED)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as PublicRow[]).map(fromRow);
  },

  async create(input, password) {
    const normalized = normalizeInput(input);
    const { data, error } = await supabase
      .from('prayer_requests')
      .insert({
        author_name: normalized.authorName,
        cohort: normalized.cohort,
        is_anonymous: normalized.isAnonymous,
        content: normalized.content,
        password,
      })
      .select(PUBLIC_COLUMNS)
      .single();
    if (error) throw error;
    return fromRow(data as PublicRow);
  },

  async update(id, input, password) {
    const normalized = normalizeInput(input);
    const { data, error } = await supabase
      .from('prayer_requests')
      .update({
        author_name: normalized.authorName,
        cohort: normalized.cohort,
        is_anonymous: normalized.isAnonymous,
        content: normalized.content,
        updated_at: new Date().toISOString(),
        ...(password ? { password } : {}),
      })
      .eq('id', id)
      // 지워진 뒤에도 열려 있던 수정 화면에서 저장이 들어올 수 있다. 그땐 갱신할
      // 행이 없어 오류가 나고, 폼이 저장 실패로 안내한다 — 되살아나지 않는다.
      .match(NOT_DELETED)
      .select(PUBLIC_COLUMNS)
      .single();
    if (error) throw error;
    return fromRow(data as PublicRow);
  },

  async incrementPrayCount(id) {
    // 증가는 DB 안에서 한 문장으로 처리한다(0002 마이그레이션). 클라이언트에서
    // 읽고-더하고-쓰면 동시에 누른 사람들이 같은 값을 읽어 카운트가 증발한다.
    const { data, error } = await supabase.rpc('increment_pray_count', { p_id: id });
    if (error) throw error;
    // 해당 id의 행이 없거나 이미 지워졌으면 갱신된 행이 없어 null이 온다(0003 마이그레이션).
    if (data === null) throw new Error(`기도제목을 찾을 수 없습니다: ${id}`);
    return data;
  },

  async verifyPassword(id, password) {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('password')
      .eq('id', id)
      .match(NOT_DELETED)
      .maybeSingle();
    if (error) throw error;
    return data ? data.password === password : false;
  },
};

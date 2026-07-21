// Supabase 구현 — prayer_requests 테이블.
// 컬럼(snake_case): id, author_name, cohort, is_anonymous, content, pray_count,
//                   password, created_at, updated_at
// 보안 수준: mock과 동일 (비밀번호 평문, 누구나 읽기/쓰기) — 교회 내부용.
// password는 절대 목록/단건 조회 select에 포함하지 않는다. 검증은 verifyPassword로만.

import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import type { PrayerInput, PrayerRequest } from '@/lib/types';
import type { PrayerRepository } from './prayer-repository';

// password를 제외한 공개 컬럼 목록 — 모든 조회에 이 상수를 사용한다.
const PUBLIC_COLUMNS =
  'id, author_name, cohort, is_anonymous, content, pray_count, created_at, updated_at';

type PublicRow = Omit<Tables<'prayer_requests'>, 'password'>;

function fromRow(row: PublicRow): PrayerRequest {
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
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as PublicRow[]).map(fromRow);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select(PUBLIC_COLUMNS)
      .eq('id', id)
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

  async update(id, input) {
    const normalized = normalizeInput(input);
    const { data, error } = await supabase
      .from('prayer_requests')
      .update({
        author_name: normalized.authorName,
        cohort: normalized.cohort,
        is_anonymous: normalized.isAnonymous,
        content: normalized.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(PUBLIC_COLUMNS)
      .single();
    if (error) throw error;
    return fromRow(data as PublicRow);
  },

  async incrementPrayCount(id) {
    // 원자적 증가가 아닌 읽기-후-쓰기. 동시 클릭 시 드물게 카운트가 1 손실될 수 있으나
    // 교회 내부 소규모 사용 환경에서는 허용 가능한 수준. 필요해지면 RPC로 전환.
    const { data: current, error: fetchError } = await supabase
      .from('prayer_requests')
      .select('pray_count')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('prayer_requests')
      .update({ pray_count: current.pray_count + 1 })
      .eq('id', id)
      .select(PUBLIC_COLUMNS)
      .single();
    if (error) throw error;
    return fromRow(data as PublicRow);
  },

  async verifyPassword(id, password) {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('password')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? data.password === password : false;
  },
};

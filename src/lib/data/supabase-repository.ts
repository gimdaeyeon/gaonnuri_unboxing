// Supabase 구현 뼈대 — 아직 미구현. 연결 시 주석의 예시를 참고해 채우세요.
//
// 테이블: prayer_requests
//   컬럼(snake_case): id, author_name, cohort, is_anonymous, category, content, pray_count, created_at, updated_at
//   인덱스 권장: (cohort, author_name)
//
// import { createClient } from '@/lib/supabase/client';
import type { PrayerRepository } from './prayer-repository';

// DB row(snake_case) ↔ 앱 타입(camelCase) 매핑 예시:
// function fromRow(row: PrayerRow): PrayerRequest {
//   return {
//     id: row.id,
//     authorName: row.author_name,
//     cohort: row.cohort,
//     isAnonymous: row.is_anonymous,
//     category: row.category ?? undefined,
//     content: row.content,
//     prayCount: row.pray_count,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at,
//   };
// }

export const supabasePrayerRepository: PrayerRepository = {
  async getAll() {
    throw new Error('Not implemented');
    // const { data, error } = await supabase.from('prayer_requests')
    //   .select('*').order('created_at', { ascending: false });
    // if (error) throw error;
    // return data.map(fromRow);
  },

  async getById(_id) {
    throw new Error('Not implemented');
    // const { data, error } = await supabase.from('prayer_requests')
    //   .select('*').eq('id', _id).maybeSingle();
    // if (error) throw error;
    // return data ? fromRow(data) : null;
  },

  async findByAuthor(_cohort, _name) {
    throw new Error('Not implemented');
    // const { data, error } = await supabase.from('prayer_requests')
    //   .select('*').eq('cohort', _cohort.trim()).ilike('author_name', _name.trim())
    //   .order('created_at', { ascending: false });
    // if (error) throw error;
    // return data.map(fromRow);
  },

  async create(_input) {
    throw new Error('Not implemented');
    // const { data, error } = await supabase.from('prayer_requests')
    //   .insert(toRow(_input)).select().single();
    // if (error) throw error;
    // return fromRow(data);
  },

  async update(_id, _input) {
    throw new Error('Not implemented');
    // const { data, error } = await supabase.from('prayer_requests')
    //   .update({ ...toRow(_input), updated_at: new Date().toISOString() })
    //   .eq('id', _id).select().single();
    // if (error) throw error;
    // return fromRow(data);
  },

  async incrementPrayCount(_id) {
    throw new Error('Not implemented');
    // 동시 클릭 대비 원자적 증가 필요 — update set pray_count = pray_count + 1 대신
    // Postgres 함수(RPC)로 처리 권장:
    //   create function increment_pray_count(p_id uuid) returns prayer_requests as $$
    //     update prayer_requests set pray_count = pray_count + 1 where id = p_id returning *;
    //   $$ language sql;
    // const { data, error } = await supabase.rpc('increment_pray_count', { p_id: _id }).single();
    // if (error) throw error;
    // return fromRow(data);
  },
};

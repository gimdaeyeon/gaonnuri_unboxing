import type { PrayerRequest, PrayerInput } from '@/lib/types';
import { mockPrayerRepository } from './mock-repository';
// import { supabasePrayerRepository } from './supabase-repository'; // 추후

export interface PrayerRepository {
  getAll(): Promise<PrayerRequest[]>;
  getById(id: string): Promise<PrayerRequest | null>;
  findByAuthor(cohort: string, name: string): Promise<PrayerRequest[]>;
  create(input: PrayerInput, password: string): Promise<PrayerRequest>;
  update(id: string, input: PrayerInput): Promise<PrayerRequest>;
  incrementPrayCount(id: string): Promise<PrayerRequest>;
  // 수정 게이트용 비밀번호 검증. 비밀번호는 읽기 모델에 노출하지 않고 이 메서드로만 확인.
  verifyPassword(id: string, password: string): Promise<boolean>;
}

// ★ Supabase 붙일 때 이 한 줄만 교체
export const prayerRepository: PrayerRepository = mockPrayerRepository;
// export const prayerRepository: PrayerRepository = supabasePrayerRepository;

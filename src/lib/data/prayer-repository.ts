import type { PrayerRequest, PrayerInput } from '@/lib/types';
import { mockPrayerRepository } from './mock-repository';
// import { supabasePrayerRepository } from './supabase-repository'; // 추후

export interface PrayerRepository {
  getAll(): Promise<PrayerRequest[]>;
  getById(id: string): Promise<PrayerRequest | null>;
  findByAuthor(cohort: string, name: string): Promise<PrayerRequest[]>;
  create(input: PrayerInput): Promise<PrayerRequest>;
  update(id: string, input: PrayerInput): Promise<PrayerRequest>;
  incrementPrayCount(id: string): Promise<PrayerRequest>;
}

// ★ Supabase 붙일 때 이 한 줄만 교체
export const prayerRepository: PrayerRepository = mockPrayerRepository;
// export const prayerRepository: PrayerRepository = supabasePrayerRepository;

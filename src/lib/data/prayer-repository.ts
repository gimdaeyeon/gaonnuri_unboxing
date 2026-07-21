import type { PrayerRequest, PrayerInput } from '@/lib/types';
// import { mockPrayerRepository } from './mock-repository'; // 로컬 개발용 fallback
import { supabasePrayerRepository } from './supabase-repository';

export interface PrayerRepository {
  getAll(): Promise<PrayerRequest[]>;
  getById(id: string): Promise<PrayerRequest | null>;
  findByAuthor(cohort: string, name: string): Promise<PrayerRequest[]>;
  create(input: PrayerInput, password: string): Promise<PrayerRequest>;
  // password를 넘기면 비밀번호도 함께 변경. 생략하면 기존 비밀번호 유지.
  update(id: string, input: PrayerInput, password?: string): Promise<PrayerRequest>;
  incrementPrayCount(id: string): Promise<PrayerRequest>;
  // 수정 게이트용 비밀번호 검증. 비밀번호는 읽기 모델에 노출하지 않고 이 메서드로만 확인.
  verifyPassword(id: string, password: string): Promise<boolean>;
}

// ★ mock으로 되돌릴 땐 이 한 줄만 교체
export const prayerRepository: PrayerRepository = supabasePrayerRepository;
// export const prayerRepository: PrayerRepository = mockPrayerRepository;

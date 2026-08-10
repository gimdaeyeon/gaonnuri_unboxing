import type { PrayerRequest, PrayerInput } from '@/lib/types';
import { supabasePrayerRepository } from './supabase-repository';

export interface PrayerRepository {
  getAll(): Promise<PrayerRequest[]>;
  getById(id: string): Promise<PrayerRequest | null>;
  findByAuthor(cohort: string, name: string): Promise<PrayerRequest[]>;
  create(input: PrayerInput, password: string): Promise<PrayerRequest>;
  // password를 넘기면 비밀번호도 함께 변경. 생략하면 기존 비밀번호 유지.
  update(id: string, input: PrayerInput, password?: string): Promise<PrayerRequest>;
  // 원자적으로 1 증가시키고 증가 후의 카운트를 돌려준다.
  incrementPrayCount(id: string): Promise<number>;
  // 소프트 삭제 — 행은 남기고 삭제 표시만 한다. 이후 위의 모든 조회에서 빠진다.
  // 이미 지워진(또는 없는) 기도제목을 지워도 오류 없이 넘어간다.
  softDelete(id: string): Promise<void>;
  // 수정 게이트용 비밀번호 검증. 비밀번호는 읽기 모델에 노출하지 않고 이 메서드로만 확인.
  verifyPassword(id: string, password: string): Promise<boolean>;
}

export const prayerRepository: PrayerRepository = supabasePrayerRepository;

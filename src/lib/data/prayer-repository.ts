// 아카이브 데이터 접근 — 2026 여름수련회가 끝나면서 Supabase 연결을 걷어내고,
// 마감 시점의 스냅샷(prayers.json — 비밀번호·숨긴 글 제외)을 번들에 담아 읽는다.
// 쓰기 계열(create/update/incrementPrayCount/verifyPassword)은 인터페이스에서 아예
// 지웠다 — 화면 코드가 실수로 쓰기를 되살릴 수 없게 타입으로 막는 게 어떤 런타임
// 가드보다 확실하다. 유일하게 살아 있는 상호작용인 '함께 기도해요'는 서버 없이
// 이 기기(localStorage)에만 쌓인다 — reacted-storage.ts 참고.

import type { PrayerRequest } from '@/lib/types';
import { localReactionDelta } from '@/lib/reacted-storage';
import archived from './prayers.json';

export interface PrayerRepository {
  getAll(): Promise<PrayerRequest[]>;
  getById(id: string): Promise<PrayerRequest | null>;
  // 또래는 정확히 일치, 이름은 마스킹(maskName) 후 대소문자 무시 완전 일치.
  findByAuthor(cohort: string, name: string): Promise<PrayerRequest[]>;
}

// 이름 마스킹 규칙 — 성(첫 글자)만 남기고 나머지는 '0'. 실명이 repo와 번들에 남지
// 않도록 스냅샷의 authorName 자체가 이 형태다(예: 김민수 → 김00). 그래서 이름
// 검색도 입력을 같은 규칙으로 마스킹한 뒤 비교한다 — 사용자는 계속 실명으로
// 검색하면 된다. 같은 또래에 성과 글자 수까지 같은 이름이 있으면 함께 걸리지만,
// 읽기 전용 아카이브라 서로의 (이미 공개돼 있던) 기도제목이 보이는 정도다.
export function maskName(name: string): string {
  const chars = [...name.trim()];
  return chars.length <= 1 ? chars.join('') : chars[0] + '0'.repeat(chars.length - 1);
}

// 스냅샷 이후의 반응은 읽는 시점에 얹는다 — 목록·단건·가중치 셔플 어디서든
// 같은 숫자가 보이도록 더하는 곳을 여기 하나로 모았다.
function withLocalReactions(prayer: PrayerRequest): PrayerRequest {
  const delta = localReactionDelta(prayer.id);
  return delta ? { ...prayer, prayCount: prayer.prayCount + delta } : prayer;
}

const prayers = archived as PrayerRequest[];

// 데이터가 번들 안으로 들어왔지만 인터페이스는 async로 유지한다 —
// usePrayers 등 소비자가 전부 Promise 기반이라 고칠 이유가 없다.
export const prayerRepository: PrayerRepository = {
  async getAll() {
    return [...prayers]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(withLocalReactions);
  },

  async getById(id) {
    const found = prayers.find((p) => p.id === id);
    return found ? withLocalReactions(found) : null;
  },

  async findByAuthor(cohort, name) {
    const targetCohort = cohort.trim();
    const targetName = maskName(name).toLowerCase();
    return prayers
      .filter((p) => p.cohort === targetCohort && p.authorName.toLowerCase() === targetName)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(withLocalReactions);
  },
};

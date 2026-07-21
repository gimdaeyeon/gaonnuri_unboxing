import type { PrayerInput, PrayerRequest } from '@/lib/types';
import { mockPrayers } from '@/lib/mock-data';
import type { PrayerRepository } from './prayer-repository';

// 내부 저장 레코드 — 비밀번호를 포함한다. 절대 그대로 반환하지 말 것 (toPublic 경유).
export type StoredPrayer = PrayerRequest & { password: string };

// 모듈 스코프 싱글턴 — SPA 라우팅 간에는 유지, 새로고침 시 초기화 (mock 단계에선 의도된 동작)
const prayers: StoredPrayer[] = mockPrayers.map((p) => ({ ...p }));

const delay = () => new Promise((resolve) => setTimeout(resolve, 150));

const byCreatedAtDesc = (a: PrayerRequest, b: PrayerRequest) =>
  b.createdAt.localeCompare(a.createdAt);

// 비밀번호를 벗겨낸 공개 읽기 모델로 변환. 모든 조회 메서드는 이 헬퍼를 거친다.
function toPublic(stored: StoredPrayer): PrayerRequest {
  const { password: _password, ...rest } = stored;
  return rest;
}

export const mockPrayerRepository: PrayerRepository = {
  async getAll() {
    await delay();
    return [...prayers].sort(byCreatedAtDesc).map(toPublic);
  },

  async getById(id) {
    await delay();
    const found = prayers.find((p) => p.id === id);
    return found ? toPublic(found) : null;
  },

  async findByAuthor(cohort, name) {
    await delay();
    const normalizedName = name.trim().toLowerCase();
    return prayers
      .filter(
        (p) =>
          p.cohort === cohort.trim() &&
          p.authorName.trim().toLowerCase() === normalizedName,
      )
      .sort(byCreatedAtDesc)
      .map(toPublic);
  },

  async create(input, password) {
    await delay();
    const now = new Date().toISOString();
    const created: StoredPrayer = {
      ...normalizeInput(input),
      id: crypto.randomUUID(),
      prayCount: 0,
      password,
      createdAt: now,
      updatedAt: now,
    };
    prayers.push(created);
    return toPublic(created);
  },

  async update(id, input, password) {
    await delay();
    const index = prayers.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`기도제목을 찾을 수 없습니다: ${id}`);
    }
    const updated: StoredPrayer = {
      ...prayers[index],
      ...normalizeInput(input),
      ...(password ? { password } : {}),
      updatedAt: new Date().toISOString(),
    };
    prayers[index] = updated;
    return toPublic(updated);
  },

  async incrementPrayCount(id) {
    await delay();
    const index = prayers.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`기도제목을 찾을 수 없습니다: ${id}`);
    }
    const updated: StoredPrayer = {
      ...prayers[index],
      prayCount: prayers[index].prayCount + 1,
    };
    prayers[index] = updated;
    return toPublic(updated);
  },

  async verifyPassword(id, password) {
    await delay();
    const found = prayers.find((p) => p.id === id);
    return found ? found.password === password : false;
  },
};

function normalizeInput(input: PrayerInput): PrayerInput {
  return {
    ...input,
    authorName: input.authorName.trim(),
    cohort: input.cohort.trim(),
    content: input.content.trim(),
  };
}

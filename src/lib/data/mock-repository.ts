import type { PrayerInput, PrayerRequest } from '@/lib/types';
import { mockPrayers } from '@/lib/mock-data';
import type { PrayerRepository } from './prayer-repository';

// 모듈 스코프 싱글턴 — SPA 라우팅 간에는 유지, 새로고침 시 초기화 (mock 단계에선 의도된 동작)
const prayers: PrayerRequest[] = [...mockPrayers];

const delay = () => new Promise((resolve) => setTimeout(resolve, 150));

const byCreatedAtDesc = (a: PrayerRequest, b: PrayerRequest) =>
  b.createdAt.localeCompare(a.createdAt);

export const mockPrayerRepository: PrayerRepository = {
  async getAll() {
    await delay();
    return [...prayers].sort(byCreatedAtDesc);
  },

  async getById(id) {
    await delay();
    return prayers.find((p) => p.id === id) ?? null;
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
      .sort(byCreatedAtDesc);
  },

  async create(input) {
    await delay();
    const now = new Date().toISOString();
    const created: PrayerRequest = {
      ...normalizeInput(input),
      id: crypto.randomUUID(),
      prayCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    prayers.push(created);
    return created;
  },

  async update(id, input) {
    await delay();
    const index = prayers.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`기도제목을 찾을 수 없습니다: ${id}`);
    }
    const updated: PrayerRequest = {
      ...prayers[index],
      ...normalizeInput(input),
      updatedAt: new Date().toISOString(),
    };
    prayers[index] = updated;
    return updated;
  },

  async incrementPrayCount(id) {
    await delay();
    const index = prayers.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`기도제목을 찾을 수 없습니다: ${id}`);
    }
    const updated: PrayerRequest = {
      ...prayers[index],
      prayCount: prayers[index].prayCount + 1,
    };
    prayers[index] = updated;
    return updated;
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

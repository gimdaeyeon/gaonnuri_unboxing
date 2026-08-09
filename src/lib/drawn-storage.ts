const STORAGE_KEY = 'prayer-drawn-ids';

// 언박싱에서 뽑은 기도제목 id 목록 — 최근에 뽑은 것이 앞. 모아보기 그리드가
// 「내가 뽑은 기도제목」을 이 순서로 보여준다. 계정이 없는 서비스라 브라우저
// 기준으로만 기억한다(반응 기록과 같은 방식).
export function getDrawnIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

// 이미 뽑았던 기도제목이면 맨 앞으로 끌어올린다 — 중복 없이, 방금 만난 것이 위에.
export function markDrawn(id: string): void {
  try {
    const next = [id, ...getDrawnIds().filter((drawn) => drawn !== id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) — 조용히 무시. 이번 방문의 뽑기 기록이
    // 모아보기에 남지 않는 정도로 열화한다.
  }
}

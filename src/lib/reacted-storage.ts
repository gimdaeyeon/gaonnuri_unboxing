const STORAGE_KEY = 'prayer-reacted-ids';

function readIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) — 조용히 무시, 이 경우 매 방문마다 다시 반응 가능해지는 정도로 열화
  }
}

export function hasReacted(id: string): boolean {
  return readIds().has(id);
}

export function markReacted(id: string): void {
  const ids = readIds();
  ids.add(id);
  writeIds(ids);
}

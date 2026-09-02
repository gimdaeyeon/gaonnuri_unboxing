// '함께 기도해요' 반응 기록. 키가 둘로 나뉜 이유:
//  - RETREAT_KEY: 수련회 기간의 반응. 당시 서버 카운트에 이미 반영돼 스냅샷
//    (prayers.json)의 prayCount에 들어 있으므로, 여기 있는 id는 버튼만
//    '눌림'으로 잠그고 숫자에는 다시 더하지 않는다(이중 계산 방지).
//  - ARCHIVE_KEY: 아카이브 전환 뒤의 반응. 서버가 없어 이 기기에만 남는 +1이고,
//    prayer-repository가 읽는 시점에 카운트에 얹는다.
const RETREAT_KEY = 'prayer-reacted-ids';
const ARCHIVE_KEY = 'prayer-reacted-archive-ids';

function readIds(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function hasReacted(id: string): boolean {
  return readIds(RETREAT_KEY).has(id) || readIds(ARCHIVE_KEY).has(id);
}

export function markReacted(id: string): void {
  const ids = readIds(ARCHIVE_KEY);
  ids.add(id);
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) — 조용히 무시, 이 경우 매 방문마다 다시 반응 가능해지는 정도로 열화
  }
}

// 아카이브 전환 뒤 이 기기에서 누른 반응만큼 카운트에 더할 값.
export function localReactionDelta(id: string): number {
  return readIds(ARCHIVE_KEY).has(id) ? 1 : 0;
}

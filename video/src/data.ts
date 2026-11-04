// 영상에 나오는 기도제목은 전부 실제 아카이브 스냅샷에서 가져온다 — 지어낸 더미가
// 아니라 진짜 운영 데이터라는 게 이 포트폴리오의 핵심이기 때문이다.
// 스냅샷은 이미 이름이 마스킹(김00)되어 있어 그대로 화면에 띄워도 안전하다.
import archived from '../../src/lib/data/prayers.json';

export interface Prayer {
  id: string;
  authorName: string;
  cohort: string;
  isAnonymous: boolean;
  content: string;
  prayCount: number;
  createdAt: string;
  updatedAt: string;
}

export const ALL = archived as Prayer[];

// 카드 레이아웃이 깨지지 않는 길이만 고른다. 너무 짧으면 카드가 휑하고
// 너무 길면 60초 안에 읽히지 않는다.
function fits(p: Prayer, min: number, max: number) {
  return p.content.length >= min && p.content.length <= max;
}

export const SHOWCASE: Prayer[] = ALL.filter((p) => fits(p, 24, 56)).slice(0, 12);

// 언박싱 장면에서 상자 밖으로 솟아오르는 한 장.
export const HERO: Prayer = SHOWCASE[0] ?? ALL[0];

export const STATS = {
  prayers: ALL.length,
  cohorts: new Set(ALL.map((p) => p.cohort)).size,
  reactions: ALL.reduce((sum, p) => sum + p.prayCount, 0),
  // 가중치 셔플이 실제로 통했다는 증거 — 이 숫자가 0이라 영상의 결론이 된다.
  unread: ALL.filter((p) => p.prayCount === 0).length,
};

export function displayName(p: Prayer) {
  return p.isAnonymous ? '익명' : p.authorName;
}

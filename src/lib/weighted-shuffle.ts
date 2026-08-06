// 가중치 기반 랜덤 셔플 (A-ES 알고리즘).
// 각 항목에 key = random()^(1/weight)를 매기고 내림차순 정렬한다 — 가중치가
// 클수록 key가 1에 가까워질 확률이 높아 앞쪽에 나올 확률이 높아지지만,
// 매번 random()이 다시 뽑히므로 결과는 여전히 무작위다(가중치 없는 완전
// 균등 셔플과 순수 정렬 사이의 절충).
export function weightedShuffle<T>(items: T[], getWeight: (item: T) => number): T[] {
  return items
    .map((item) => {
      const weight = Math.max(getWeight(item), MIN_WEIGHT);
      const key = Math.pow(Math.random(), 1 / weight);
      return { item, key };
    })
    .sort((a, b) => b.key - a.key)
    .map(({ item }) => item);
}

// 가중치가 0 이하이면 key가 항상 0 또는 NaN이 되어 정렬이 무의미해지므로
// 아주 작은 양수로 바닥을 둔다.
const MIN_WEIGHT = 1e-6;

// 기도 카운트가 낮을수록 더 자주(그리고 더 앞쪽에) 나오도록 하는 가중치.
// +1은 카운트 0인 항목이 무한대 가중치가 되는 것을 막기 위한 스무딩이다.
export function prayCountWeight(prayCount: number): number {
  return 1 / (prayCount + 1);
}

// 중복 없이 순회하는 랜덤 큐. 전체를 셔플해 순서대로 소비하고,
// 다 소비하면 재셔플한다 (직전 마지막 항목이 다음 셔플의 첫 항목과
// 겹치면 한 칸 밀어내 "방금 본 걸 또 보는" 체감을 줄인다).
// 항목 동일성은 getKey로 판단한다 — 반응(좋아요) 갱신처럼 객체 참조가
// 바뀌어도(같은 id의 새 객체) 같은 항목으로 인식하기 위함.
export class ShuffleQueue<T> {
  private items: T[];
  private getKey: (item: T) => unknown;
  private queue: T[] = [];
  private lastKey: unknown;

  constructor(items: T[], getKey: (item: T) => unknown = (item) => item) {
    this.items = items;
    this.getKey = getKey;
  }

  update(items: T[]) {
    this.items = items;
    // 아이템 목록이 바뀌면(추가/삭제) 다음 뽑기부터 새 셔플을 적용한다.
    this.queue = [];
  }

  next(): T | undefined {
    if (this.items.length === 0) return undefined;
    if (this.queue.length === 0) {
      this.queue = shuffle(this.items);
      if (this.queue.length > 1 && this.getKey(this.queue[0]) === this.lastKey) {
        [this.queue[0], this.queue[1]] = [this.queue[1], this.queue[0]];
      }
    }
    const item = this.queue.shift();
    if (item !== undefined) this.lastKey = this.getKey(item);
    return item;
  }
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

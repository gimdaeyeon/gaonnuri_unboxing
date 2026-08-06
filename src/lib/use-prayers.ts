import { useEffect, useState } from 'react';
import type { PrayerRequest } from '@/lib/types';
import { prayerRepository } from '@/lib/data/prayer-repository';
import { prayCountWeight, weightedShuffle } from '@/lib/weighted-shuffle';

// 기도제목 목록 로딩 + 반응 상태 갱신. 그리드/슬라이드/릴스/언박싱 페이지가 공유한다.
// 표시 순서는 매번 마운트될 때마다 무작위로 섞되, 기도 카운트가 낮은
// 기도제목일수록 앞쪽에 나올 확률이 높도록 가중치를 준다.
export function usePrayers() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    prayerRepository
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setPrayers(weightedShuffle(data, (p) => prayCountWeight(p.prayCount)));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleReacted(updated: PrayerRequest) {
    setPrayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return { prayers, loading, handleReacted };
}

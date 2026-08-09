import { useEffect, useMemo, useState } from 'react';
import type { PrayerRequest } from '@/lib/types';
import { prayerRepository } from '@/lib/data/prayer-repository';
import { getDrawnIds } from '@/lib/drawn-storage';
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

// 언박싱에서 뽑았던 기도제목만, 최근에 뽑은 순으로 추린다(그 사이 지워진 건 자연히 빠진다).
// 뽑기 기록은 마운트 시점에 한 번만 읽는다 — 뽑기는 언박싱 페이지에서만 일어나고
// 그 페이지를 떠나면 모아보기가 새로 마운트되므로 항상 최신이다.
export function useDrawnPrayers(prayers: PrayerRequest[]): PrayerRequest[] {
  const [drawnIds] = useState(getDrawnIds);

  return useMemo(() => {
    const byId = new Map(prayers.map((p) => [p.id, p]));
    return drawnIds
      .map((id) => byId.get(id))
      .filter((prayer) => prayer !== undefined);
  }, [prayers, drawnIds]);
}

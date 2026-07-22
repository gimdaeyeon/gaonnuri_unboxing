import { useEffect, useState } from 'react';
import type { PrayerRequest } from '@/lib/types';
import { prayerRepository } from '@/lib/data/prayer-repository';

// 기도제목 목록 로딩 + 반응 상태 갱신. 그리드/슬라이드/릴스/언박싱 페이지가 공유한다.
export function usePrayers() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    prayerRepository
      .getAll()
      .then((data) => {
        if (!cancelled) setPrayers(data);
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

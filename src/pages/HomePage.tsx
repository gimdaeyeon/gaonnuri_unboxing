import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search } from 'lucide-react';
import type { PrayerRequest } from '@/lib/types';
import { prayerRepository } from '@/lib/data/prayer-repository';
import { ViewSwitcher, type PrayerViewMode } from '@/components/prayer/ViewSwitcher';
import { GridView } from '@/components/prayer/views/GridView';
import { SlideView } from '@/components/prayer/views/SlideView';
import { ReelsView } from '@/components/prayer/views/ReelsView';
import { Button } from '@/components/ui/button';

export function HomePage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PrayerViewMode>('grid');

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

  if (view === 'reels' && !loading) {
    return (
      <div className="fixed inset-0 bg-bg">
        <ReelsView prayers={prayers} onReacted={handleReacted} />
        <div className="fixed left-1/2 top-4 -translate-x-1/2">
          <ViewSwitcher value={view} onChange={setView} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-heading text-2xl font-bold">수련회 기도제목</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/find">
                <Search /> 내 기도제목 찾기
              </Link>
            </Button>
            <Button asChild>
              <Link to="/new">
                <Plus /> 기도제목 추가
              </Link>
            </Button>
          </div>
        </div>
        <ViewSwitcher value={view} onChange={setView} />
      </header>

      <main className="flex-1">
        {loading ? (
          <p className="py-20 text-center text-text-muted">불러오는 중…</p>
        ) : prayers.length === 0 ? (
          <p className="py-20 text-center text-text-muted">
            아직 기도제목이 없어요. 첫 기도제목을 남겨 보세요!
          </p>
        ) : view === 'grid' ? (
          <GridView prayers={prayers} onReacted={handleReacted} />
        ) : (
          <SlideView prayers={prayers} onReacted={handleReacted} />
        )}
      </main>

      <Button
        asChild
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg sm:hidden"
      >
        <Link to="/new" aria-label="기도제목 추가">
          <Plus /> 추가
        </Link>
      </Button>
    </div>
  );
}

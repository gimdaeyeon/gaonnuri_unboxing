import { usePrayers } from '@/lib/use-prayers';
import { PrayerListLayout } from '@/components/prayer/PrayerListLayout';
import { GridView } from '@/components/prayer/views/GridView';

export function GridPage() {
  const { prayers, loading, handleReacted } = usePrayers();

  return (
    <PrayerListLayout>
      {loading ? (
        <p className="py-20 text-center text-text-muted">불러오는 중…</p>
      ) : prayers.length === 0 ? (
        <p className="py-20 text-center text-text-muted">
          아직 기도제목이 없어요. 첫 기도제목을 남겨 보세요!
        </p>
      ) : (
        <GridView prayers={prayers} onReacted={handleReacted} />
      )}
    </PrayerListLayout>
  );
}

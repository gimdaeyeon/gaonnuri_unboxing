import { Link } from 'react-router';
import { useDrawnPrayers, usePrayers } from '@/lib/use-prayers';
import { PrayerListLayout } from '@/components/prayer/PrayerListLayout';
import { GridView } from '@/components/prayer/views/GridView';

// 「내가 뽑은 기도제목」 — 언박싱에서 뽑아 본 것만 최근 순으로 모아 본다.
// 전체 기도제목은 슬라이드·릴스가 맡는다.
export function GridPage() {
  const { prayers, loading, handleReacted } = usePrayers();
  const drawnPrayers = useDrawnPrayers(prayers);

  return (
    <PrayerListLayout>
      {loading ? (
        <p className="py-20 text-center text-text-muted">불러오는 중…</p>
      ) : prayers.length === 0 ? (
        <p className="py-20 text-center text-text-muted">
          아직 기도제목이 없어요. 첫 기도제목을 남겨 보세요!
        </p>
      ) : drawnPrayers.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-text-muted">
            아직 뽑은 기도제목이 없어요. 박스를 열어 하나 뽑아 보세요!
          </p>
          <Link
            to="/"
            className="rounded-theme bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            뽑으러 가기
          </Link>
        </div>
      ) : (
        <GridView prayers={drawnPrayers} onReacted={handleReacted} />
      )}
    </PrayerListLayout>
  );
}

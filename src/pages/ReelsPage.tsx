import { usePrayers } from '@/lib/use-prayers';
import { ViewNav } from '@/components/prayer/ViewNav';
import { ReelsView } from '@/components/prayer/views/ReelsView';

export function ReelsPage() {
  const { prayers, loading, handleReacted } = usePrayers();

  return (
    <div className="fixed inset-0 bg-bg">
      {loading ? (
        <p className="py-20 text-center text-text-muted">불러오는 중…</p>
      ) : prayers.length === 0 ? (
        <p className="py-20 text-center text-text-muted">
          아직 기도제목이 없어요. 첫 기도제목을 남겨 보세요!
        </p>
      ) : (
        <ReelsView prayers={prayers} onReacted={handleReacted} />
      )}
      <div className="fixed left-1/2 top-4 -translate-x-1/2">
        <ViewNav />
      </div>
    </div>
  );
}

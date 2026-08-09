import { usePrayers } from '@/lib/use-prayers';
import { ViewNav } from '@/components/prayer/ViewNav';
import { ReelsView } from '@/components/prayer/views/ReelsView';

export function ReelsPage() {
  const { prayers, loading, handleReacted } = usePrayers();

  return (
    // 하단은 BottomTabBar(3.5rem + 세이프에어리어) 위까지만 차지한다 —
    // 안 그러면 마지막 카드의 반응 버튼·스와이프 힌트가 탭바에 가린다.
    <div className="fixed inset-x-0 top-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] bg-bg">
      {loading ? (
        <p className="py-20 text-center text-text-muted">불러오는 중…</p>
      ) : prayers.length === 0 ? (
        <p className="py-20 text-center text-text-muted">
          아직 기도제목이 없어요. 첫 기도제목을 남겨 보세요!
        </p>
      ) : (
        <ReelsView prayers={prayers} onReacted={handleReacted} />
      )}
      {/* inset-x-0 + justify-center로 가운데를 맞춘다 — left-1/2는 고정 요소의 폭을
          화면 절반으로 가둬 버려서 탭 이름이 줄바꿈된다. 스와이프를 막지 않도록
          네비 자신(pointer-events-auto)만 클릭을 받는다. */}
      <div className="pointer-events-none fixed inset-x-0 top-4 flex justify-center px-4">
        <ViewNav centered />
      </div>
    </div>
  );
}

// /edit/:id — 수련회 기간의 수정 화면이 있던 자리. 아카이브 전환으로 수정이 닫히면서
// 내 기도제목 찾기의 수정 버튼은 더 이상 여기로 오지 않고(누르면 종료 안내만 띄운다),
// 북마크·공유된 딥링크만 도달한다. 기도제목은 보여주되 종료 안내로 마무리한다.
// 비밀번호 게이트도 함께 사라졌다 — 스냅샷에는 비밀번호가 아예 없어 검증할 수도 없다.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import type { PrayerRequest } from '@/lib/types';
import { prayerRepository } from '@/lib/data/prayer-repository';
import { PrayerCard } from '@/components/prayer/PrayerCard';
import { Button } from '@/components/ui/button';
import { useReturnTo } from '@/lib/use-return-to';
import { TAB_BAR_PAD } from '@/components/nav/BottomTabBar';

export function EditPage() {
  const { id } = useParams<{ id: string }>();
  const returnTo = useReturnTo('/find');
  const [prayer, setPrayer] = useState<PrayerRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    prayerRepository
      .getById(id)
      .then((data) => {
        if (!cancelled) setPrayer(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className={`mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-4 py-8 sm:px-6 ${TAB_BAR_PAD}`}>
      <header className="flex flex-col gap-4">
        <Link to={returnTo} className="flex items-center gap-1 text-sm text-text-muted hover:text-text">
          <ArrowLeft className="size-4" /> 뒤로
        </Link>
        <h1 className="font-heading text-2xl font-bold">기도제목 수정</h1>
      </header>

      {loading ? (
        <p className="py-20 text-center text-text-muted">불러오는 중…</p>
      ) : !prayer ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <p className="text-text-muted">기도제목을 찾을 수 없습니다.</p>
          <Button asChild variant="outline">
            <Link to="/find">다시 검색하기</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <PrayerCard prayer={prayer} onReacted={setPrayer} />
          <div className="rounded-theme border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            2026 여름수련회가 마무리되어 기도제목은 더 이상 수정할 수 없어요. 남겨주신
            그대로 기록으로 보관돼요.
          </div>
        </div>
      )}
    </div>
  );
}

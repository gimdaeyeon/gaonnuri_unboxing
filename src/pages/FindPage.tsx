import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { PrayerFinder } from '@/components/prayer/PrayerFinder';
import { useReturnTo } from '@/lib/use-return-to';
import { TAB_BAR_PAD } from '@/components/nav/BottomTabBar';

export function FindPage() {
  const returnTo = useReturnTo('/');

  return (
    <div className={`mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-4 py-8 sm:px-6 ${TAB_BAR_PAD}`}>
      <header className="flex flex-col gap-4">
        <Link to={returnTo} className="flex items-center gap-1 text-sm text-text-muted hover:text-text">
          <ArrowLeft className="size-4" /> 뒤로
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold">내 기도제목 찾기</h1>
          <p className="text-sm text-text-muted">
            작성할 때 입력한 또래와 이름으로 내 기도제목을 찾아 수정할 수 있어요.
          </p>
        </div>
      </header>
      <PrayerFinder />
    </div>
  );
}

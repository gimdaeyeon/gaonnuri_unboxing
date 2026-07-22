import { Link, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import type { PrayerInput } from '@/lib/types';
import { prayerRepository } from '@/lib/data/prayer-repository';
import { PrayerForm } from '@/components/prayer/PrayerForm';
import { useReturnTo } from '@/lib/use-return-to';
import { TAB_BAR_PAD } from '@/components/nav/BottomTabBar';

export function NewPage() {
  const navigate = useNavigate();
  const returnTo = useReturnTo('/grid');

  async function handleSubmit(input: PrayerInput, password?: string) {
    await prayerRepository.create(input, password ?? '');
    navigate(returnTo);
  }

  return (
    <div className={`mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-4 py-8 sm:px-6 ${TAB_BAR_PAD}`}>
      <header className="flex flex-col gap-4">
        <Link to={returnTo} className="flex items-center gap-1 text-sm text-text-muted hover:text-text">
          <ArrowLeft className="size-4" /> 뒤로
        </Link>
        <h1 className="font-heading text-2xl font-bold">기도제목 남기기</h1>
      </header>
      <PrayerForm requirePassword submitLabel="기도제목 올리기" onSubmit={handleSubmit} />
    </div>
  );
}

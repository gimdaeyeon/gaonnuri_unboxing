import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import type { PrayerInput, PrayerRequest } from '@/lib/types';
import { prayerRepository } from '@/lib/data/prayer-repository';
import { PrayerForm } from '@/components/prayer/PrayerForm';
import { Button } from '@/components/ui/button';

export function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  async function handleSubmit(input: PrayerInput) {
    if (!id) return;
    await prayerRepository.update(id, input);
    navigate('/find');
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4">
        <Link to="/find" className="flex items-center gap-1 text-sm text-text-muted hover:text-text">
          <ArrowLeft className="size-4" /> 검색으로
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
        <PrayerForm
          initialValue={{
            authorName: prayer.authorName,
            cohort: prayer.cohort,
            isAnonymous: prayer.isAnonymous,
            category: prayer.category,
            content: prayer.content,
          }}
          submitLabel="수정 저장"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import type { PrayerRequest } from '@/lib/types';
import { prayerRepository } from '@/lib/data/prayer-repository';
import { PrayerCard } from '@/components/prayer/PrayerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PrayerFinder() {
  const [cohort, setCohort] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<PrayerRequest[] | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{2}$/.test(cohort.trim())) {
      setError('또래는 출생연도 뒤 2자리 숫자로 입력해 주세요. (예: 99)');
      return;
    }
    if (!name.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    setError(null);
    setSearching(true);
    try {
      const found = await prayerRepository.findByAuthor(cohort.trim(), name);
      setResults(found);
    } catch {
      setError('검색에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSearching(false);
    }
  }

  function handleReacted(updated: PrayerRequest) {
    setResults((prev) => prev?.map((p) => (p.id === updated.id ? updated : p)) ?? prev);
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-[7rem_1fr] gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="find-cohort">또래</Label>
            <Input
              id="find-cohort"
              inputMode="numeric"
              maxLength={2}
              placeholder="99"
              value={cohort}
              onChange={(e) => setCohort(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="find-name">이름</Label>
            <Input
              id="find-name"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={searching}>
          {searching ? '찾는 중…' : '내 기도제목 찾기'}
        </Button>
      </form>

      {results !== null &&
        (results.length === 0 ? (
          <p className="rounded-theme border border-border bg-surface p-6 text-center text-text-muted">
            해당하는 기도제목이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {results.map((prayer) => (
              <li key={prayer.id} className="flex flex-col gap-2">
                <PrayerCard prayer={prayer} onReacted={handleReacted} />
                <Button asChild variant="outline" className="self-end">
                  <Link to={`/edit/${prayer.id}`} state={{ from: '/find' }}>
                    수정
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

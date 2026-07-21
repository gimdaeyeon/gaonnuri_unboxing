import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import type { PrayerInput, PrayerRequest } from '@/lib/types';
import { getDisplayName } from '@/lib/types';
import { prayerRepository } from '@/lib/data/prayer-repository';
import { PrayerForm } from '@/components/prayer/PrayerForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prayer, setPrayer] = useState<PrayerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

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
      ) : !authorized ? (
        <PasswordGate id={id!} prayer={prayer} onUnlock={() => setAuthorized(true)} />
      ) : (
        <PrayerForm
          initialValue={{
            authorName: prayer.authorName,
            cohort: prayer.cohort,
            isAnonymous: prayer.isAnonymous,
            content: prayer.content,
          }}
          submitLabel="수정 저장"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

interface PasswordGateProps {
  id: string;
  prayer: PrayerRequest;
  onUnlock: () => void;
}

function PasswordGate({ id, prayer, onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const ok = await prayerRepository.verifyPassword(id, password);
      if (ok) {
        onUnlock();
      } else {
        setError('비밀번호가 일치하지 않습니다.');
      }
    } catch {
      setError('확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="rounded-theme border border-border bg-surface px-4 py-3 text-sm">
        <span className="font-semibold text-primary">{prayer.cohort}또래</span>{' '}
        <span>{getDisplayName(prayer)}</span> 님의 기도제목을 수정하려면 비밀번호를 입력해 주세요.
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="gate-password">비밀번호</Label>
        <Input
          id="gate-password"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          placeholder="작성 시 정한 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
          autoFocus
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button type="submit" size="lg" disabled={checking}>
        {checking ? '확인 중…' : '확인'}
      </Button>
    </form>
  );
}

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { adminRepository, type AdminPrayer } from '@/lib/data/admin-repository';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TAB_BAR_PAD } from '@/components/nav/BottomTabBar';

// 관리자 페이지 — 탭바에 없는 숨은 경로(/admin). 입장 비밀번호는 빌드 시점
// env(VITE_ADMIN_PASSWORD)와 비교한다 — DB 왕복 없이 앱 안에서 끝나지만,
// 빌드 산출물 JS에 값이 그대로 실리므로 개발자 도구로 찾을 수는 있다.
// RLS 자체가 누구나 쓰기라 게이트는 어차피 화면 접근을 막는 수준이다 — 교회 내부용.
// 통과 여부는 탭 세션 동안만 기억한다.

const ADMIN_PASSWORD: string | undefined = import.meta.env.VITE_ADMIN_PASSWORD;

const SESSION_KEY = 'unboxing-admin-authed';

function isAdminSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberAdminSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // 저장 실패(프라이빗 모드 등)면 새로고침할 때 다시 비밀번호를 묻는 정도로 열화한다.
  }
}

function forgetAdminSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // 위와 같은 이유 — 지우기 실패는 무시한다.
  }
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminPage() {
  const [authorized, setAuthorized] = useState(isAdminSession);

  function handleLock() {
    forgetAdminSession();
    setAuthorized(false);
  }

  return (
    <div className={`mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 ${TAB_BAR_PAD}`}>
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold">기도제목 관리</h1>
          <p className="text-sm text-text-muted">
            올라온 기도제목을 살펴보고 정리하는 관리자 화면이에요.
          </p>
        </div>
        {authorized && (
          <Button type="button" variant="ghost" size="sm" onClick={handleLock}>
            <LockKeyhole /> 잠그기
          </Button>
        )}
      </header>

      {authorized ? (
        <AdminList />
      ) : (
        <AdminGate
          onUnlock={() => {
            rememberAdminSession();
            setAuthorized(true);
          }}
        />
      )}
    </div>
  );
}

interface AdminGateProps {
  onUnlock: () => void;
}

function AdminGate({ onUnlock }: AdminGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ADMIN_PASSWORD) {
      // env가 비어 있으면 아무 비밀번호도 통하지 않게 막는다 — 기본값을 두면
      // 그 기본값이 곧 공개된 비밀번호가 된다.
      setError('관리자 비밀번호가 설정되지 않았어요. .env.local에 VITE_ADMIN_PASSWORD를 추가해 주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    if (password === ADMIN_PASSWORD) {
      onUnlock();
    } else {
      setError('비밀번호가 일치하지 않습니다.');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="rounded-theme border border-border bg-surface px-4 py-3 text-sm">
        관리자 전용 화면이에요. 계속하려면 관리자 비밀번호를 입력해 주세요.
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-password">관리자 비밀번호</Label>
        <Input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          placeholder="관리자 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
          autoFocus
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button type="submit" size="lg">
        들어가기
      </Button>
    </form>
  );
}

// 화면에서는 '숨기기'로 부르지만 저장되는 건 그대로 소프트 삭제(is_del)다 —
// 되돌릴 수 있는 동작이라 '삭제'보다 실제 결과에 가까운 말이고, 관리자가
// 지웠다고 겁먹을 일도 없다. 그래서 UI 상태 이름은 hide 계열, 데이터 쪽
// (AdminPrayer.isDeleted, adminRepository.softDelete)은 DB 어휘 그대로 둔다.
function AdminList() {
  const [prayers, setPrayers] = useState<AdminPrayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [pendingHide, setPendingHide] = useState<AdminPrayer | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminRepository
      .getAll()
      .then((data) => {
        if (!cancelled) setPrayers(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError('목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prayers.filter(
      (p) =>
        (showHidden || !p.isDeleted) &&
        (!q ||
          p.authorName.toLowerCase().includes(q) ||
          p.cohort.includes(q) ||
          p.content.toLowerCase().includes(q)),
    );
  }, [prayers, query, showHidden]);

  const hiddenCount = prayers.filter((p) => p.isDeleted).length;
  const visibleCount = prayers.length - hiddenCount;

  // 숨기기/다시 보이기는 같은 플래그의 양방향이라 한 함수로 처리한다.
  // 성공하면 목록을 다시 불러오는 대신 해당 항목의 표시만 뒤집는다 — 순서가 유지되고,
  // '숨긴 것도 보기'가 켜져 있으면 방금 숨긴 항목이 그 자리에 숨김으로 남는다.
  async function setHidden(prayer: AdminPrayer, next: boolean) {
    setBusyId(prayer.id);
    setActionError(null);
    try {
      if (next) {
        await adminRepository.softDelete(prayer.id);
      } else {
        await adminRepository.restore(prayer.id);
      }
      setPrayers((prev) =>
        prev.map((p) => (p.id === prayer.id ? { ...p, isDeleted: next } : p)),
      );
    } catch {
      setActionError(
        next
          ? '숨기기에 실패했습니다. 잠시 후 다시 시도해 주세요.'
          : '다시 보이기에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setBusyId(null);
    }
  }

  function handleConfirmHide() {
    const target = pendingHide;
    setPendingHide(null);
    if (target) void setHidden(target, true);
  }

  if (loading) {
    return <p className="py-20 text-center text-text-muted">불러오는 중…</p>;
  }
  if (loadError) {
    return (
      <p className="rounded-theme border border-border bg-surface p-6 text-center text-text-muted">
        {loadError}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="이름·또래·내용으로 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-text-muted">
          공개 중 {visibleCount} · 숨김 {hiddenCount}
        </span>
        <div className="flex items-center gap-2">
          <Label htmlFor="show-hidden" className="text-sm text-text-muted">
            숨긴 것도 보기
          </Label>
          <Switch id="show-hidden" checked={showHidden} onCheckedChange={setShowHidden} />
        </div>
      </div>

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      {visible.length === 0 ? (
        <p className="rounded-theme border border-border bg-surface p-6 text-center text-text-muted">
          {query.trim() ? '검색 결과가 없어요.' : '아직 올라온 기도제목이 없어요.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((prayer) => (
            <li key={prayer.id}>
              <article
                className={`flex flex-col gap-3 rounded-theme border border-border bg-surface p-5 ${
                  prayer.isDeleted ? 'opacity-70' : ''
                }`}
              >
                <header className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary-ink">
                    {prayer.cohort}또래
                  </span>
                  {/* 관리 화면에서는 익명이어도 실명을 보여준다 — 대신 공개 목록에서
                      익명으로 나가는 글임을 칩으로 표시한다. */}
                  <span className="text-sm font-medium">{prayer.authorName}</span>
                  {prayer.isAnonymous && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-text-muted">
                      익명
                    </span>
                  )}
                  {prayer.isDeleted && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      숨김
                    </span>
                  )}
                  <span className="ml-auto text-xs text-text-muted">
                    {formatDateTime(prayer.createdAt)}
                  </span>
                </header>
                <p className="whitespace-pre-wrap break-keep text-[15px] leading-relaxed">
                  {prayer.content}
                </p>
                <footer className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">함께 기도해요 {prayer.prayCount}</span>
                  {prayer.isDeleted ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busyId === prayer.id}
                      onClick={() => void setHidden(prayer, false)}
                    >
                      <Eye /> 다시 보이기
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={busyId === prayer.id}
                      onClick={() => setPendingHide(prayer)}
                    >
                      <EyeOff /> 숨기기
                    </Button>
                  )}
                </footer>
              </article>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={pendingHide !== null}
        onOpenChange={(open) => {
          if (!open) setPendingHide(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <EyeOff className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>이 기도제목을 숨길까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingHide &&
                `${pendingHide.cohort}또래 ${pendingHide.authorName} 님의 기도제목이 공개 목록에서 사라져요. `}
              &lsquo;숨긴 것도 보기&rsquo;에서 언제든 다시 보이게 할 수 있어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmHide}>
              숨기기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

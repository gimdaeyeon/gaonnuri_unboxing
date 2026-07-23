import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import type { PrayerInput } from '@/lib/types';
import { prayerRepository } from '@/lib/data/prayer-repository';
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
import { Textarea } from '@/components/ui/textarea';

const PASSWORD_MIN_LENGTH = 4;

interface PrayerFormProps {
  initialValue?: PrayerInput;
  submitLabel: string;
  // requirePassword일 때 두 번째 인자로 비밀번호를 넘긴다. (새 글 작성 — 필수)
  requirePassword?: boolean;
  // allowPasswordChange일 때 비밀번호 필드를 선택 입력으로 노출한다. (수정 — 비워두면 기존 비밀번호 유지)
  allowPasswordChange?: boolean;
  // 켜두면 제출 전 같은 또래+이름의 기존 기도제목을 조회해 한 번 안내한다.
  // 수정 화면(EditPage)은 자기 자신과 항상 매칭되므로 끈 채로 둔다.
  checkDuplicate?: boolean;
  onSubmit: (input: PrayerInput, password?: string) => Promise<void>;
}

interface FieldErrors {
  cohort?: string;
  authorName?: string;
  content?: string;
  password?: string;
}

export function PrayerForm({
  initialValue,
  submitLabel,
  requirePassword = false,
  allowPasswordChange = false,
  checkDuplicate = false,
  onSubmit,
}: PrayerFormProps) {
  const showPasswordField = requirePassword || allowPasswordChange;
  const [cohort, setCohort] = useState(initialValue?.cohort ?? '');
  const [authorName, setAuthorName] = useState(initialValue?.authorName ?? '');
  const [isAnonymous, setIsAnonymous] = useState(initialValue?.isAnonymous ?? false);
  const [content, setContent] = useState(initialValue?.content ?? '');
  const [password, setPassword] = useState(requirePassword ? '0000' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // 확인 다이얼로그에 띄울 개수. 또래/이름이 바뀌면 다시 확인해야 하므로 리셋된다.
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function resetDuplicateNotice() {
    setDuplicateCount(0);
    setConfirmOpen(false);
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!/^\d{2}$/.test(cohort.trim())) {
      next.cohort = '출생연도 뒤 2자리 숫자로 입력해 주세요. (예: 99)';
    }
    if (!authorName.trim()) {
      next.authorName = '이름을 입력해 주세요.';
    }
    if (!content.trim()) {
      next.content = '기도제목을 입력해 주세요.';
    }
    if (requirePassword && password.length < PASSWORD_MIN_LENGTH) {
      next.password = `비밀번호를 ${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`;
    } else if (allowPasswordChange && password && password.length < PASSWORD_MIN_LENGTH) {
      next.password = `비밀번호를 ${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`;
    }
    return next;
  }

  async function submitNow() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(
        {
          cohort: cohort.trim(),
          authorName: authorName.trim(),
          isAnonymous,
          content: content.trim(),
        },
        requirePassword ? password : allowPasswordChange && password ? password : undefined,
      );
    } catch {
      setSubmitError('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (checkDuplicate) {
      setSubmitting(true);
      let hasDuplicate = false;
      try {
        const existing = await prayerRepository.findByAuthor(cohort.trim(), authorName.trim());
        if (existing.length > 0) {
          hasDuplicate = true;
          setDuplicateCount(existing.length);
          setConfirmOpen(true);
        }
      } catch {
        // 중복 확인은 편의 기능일 뿐이므로 실패해도 저장은 막지 않는다(fail-open).
      }
      setSubmitting(false);
      if (hasDuplicate) return;
    }

    await submitNow();
  }

  function handleConfirmDuplicate() {
    setConfirmOpen(false);
    void submitNow();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-[7rem_1fr] gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cohort">또래</Label>
          <Input
            id="cohort"
            inputMode="numeric"
            maxLength={2}
            placeholder="99"
            value={cohort}
            onChange={(e) => {
              setCohort(e.target.value.replace(/\D/g, ''));
              resetDuplicateNotice();
            }}
            aria-invalid={!!errors.cohort}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="authorName">이름</Label>
          <Input
            id="authorName"
            placeholder="홍길동"
            value={authorName}
            onChange={(e) => {
              setAuthorName(e.target.value);
              resetDuplicateNotice();
            }}
            aria-invalid={!!errors.authorName}
          />
        </div>
      </div>
      {(errors.cohort || errors.authorName) && (
        <p className="-mt-4 text-sm text-destructive">{errors.cohort ?? errors.authorName}</p>
      )}
      <p className="-mt-3 text-sm text-text-muted">
        또래와 이름은 나중에 내 기도제목을 찾아 수정할 때 필요해요.
      </p>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Info className="text-accent" />
            </AlertDialogMedia>
            <AlertDialogTitle>이미 같은 또래·이름이 있어요</AlertDialogTitle>
            <AlertDialogDescription>
              &lsquo;{cohort}또래 {authorName}&rsquo;(으)로 올린 기도제목이 {duplicateCount}개 있어요.
              계속 올릴까요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDuplicate}>그래도 올리기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between rounded-theme border border-border bg-surface px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="isAnonymous">익명으로 올리기</Label>
          <span className="text-sm text-text-muted">목록에서 이름이 &lsquo;익명&rsquo;으로 표시돼요.</span>
        </div>
        <Switch id="isAnonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="content">기도제목</Label>
        <Textarea
          id="content"
          rows={6}
          placeholder="함께 기도하고 싶은 내용을 적어 주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-invalid={!!errors.content}
          className="min-h-36"
        />
        {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
      </div>

      {showPasswordField && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{requirePassword ? '수정 비밀번호' : '새 비밀번호 (선택)'}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              inputMode="numeric"
              autoComplete="new-password"
              placeholder={requirePassword ? '4자 이상' : '변경하려면 4자 이상 입력'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              className="absolute inset-y-0 right-2.5 flex items-center text-text-muted hover:text-text"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password}</p>
          ) : (
            <p className="text-sm text-text-muted">
              {requirePassword
                ? '나중에 이 기도제목을 수정할 때 필요해요. 잊지 않도록 기억해 주세요.'
                : '비워두면 기존 비밀번호가 그대로 유지돼요.'}
            </p>
          )}
        </div>
      )}

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? '저장 중…' : submitLabel}
      </Button>
    </form>
  );
}

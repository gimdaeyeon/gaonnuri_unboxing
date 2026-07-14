import { useState } from 'react';
import type { FormEvent } from 'react';
import type { PrayerCategory, PrayerInput } from '@/lib/types';
import { PRAYER_CATEGORY_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORY_NONE = 'none';

const PASSWORD_MIN_LENGTH = 4;

interface PrayerFormProps {
  initialValue?: PrayerInput;
  submitLabel: string;
  // requirePassword일 때 두 번째 인자로 비밀번호를 넘긴다.
  requirePassword?: boolean;
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
  onSubmit,
}: PrayerFormProps) {
  const [cohort, setCohort] = useState(initialValue?.cohort ?? '');
  const [authorName, setAuthorName] = useState(initialValue?.authorName ?? '');
  const [isAnonymous, setIsAnonymous] = useState(initialValue?.isAnonymous ?? false);
  const [category, setCategory] = useState<string>(initialValue?.category ?? CATEGORY_NONE);
  const [content, setContent] = useState(initialValue?.content ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    }
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(
        {
          cohort: cohort.trim(),
          authorName: authorName.trim(),
          isAnonymous,
          category: category === CATEGORY_NONE ? undefined : (category as PrayerCategory),
          content: content.trim(),
        },
        requirePassword ? password : undefined,
      );
    } catch {
      setSubmitError('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setSubmitting(false);
    }
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
            onChange={(e) => setCohort(e.target.value.replace(/\D/g, ''))}
            aria-invalid={!!errors.cohort}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="authorName">이름</Label>
          <Input
            id="authorName"
            placeholder="홍길동"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
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

      <div className="flex items-center justify-between rounded-theme border border-border bg-surface px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="isAnonymous">익명으로 올리기</Label>
          <span className="text-sm text-text-muted">목록에서 이름이 &lsquo;익명&rsquo;으로 표시돼요.</span>
        </div>
        <Switch id="isAnonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">
          카테고리 <span className="font-normal text-text-muted">(선택)</span>
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="선택 안 함" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CATEGORY_NONE}>선택 안 함</SelectItem>
            {Object.entries(PRAYER_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {requirePassword && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">수정 비밀번호</Label>
          <Input
            id="password"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            placeholder="4자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password}</p>
          ) : (
            <p className="text-sm text-text-muted">
              나중에 이 기도제목을 수정할 때 필요해요. 잊지 않도록 기억해 주세요.
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

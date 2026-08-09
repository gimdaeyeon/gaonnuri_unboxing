import { useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import type { PrayerRequest } from '@/lib/types';
import { hasReacted, markReacted, unmarkReacted } from '@/lib/reacted-storage';
import { prayerRepository } from '@/lib/data/prayer-repository';
import { Button } from '@/components/ui/button';

interface PrayerReactionButtonProps {
  prayer: PrayerRequest;
  onReacted?: (updated: PrayerRequest) => void;
}

export function PrayerReactionButton({ prayer, onReacted }: PrayerReactionButtonProps) {
  const [reacted, setReacted] = useState(() => hasReacted(prayer.id));
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    if (reacted || submitting) return;
    setSubmitting(true);
    // 먼저 눌린 것으로 표시해 반응을 즉시 보여주고, 실패하면 아래에서 되돌린다.
    markReacted(prayer.id);
    setReacted(true);
    try {
      const prayCount = await prayerRepository.incrementPrayCount(prayer.id);
      onReacted?.({ ...prayer, prayCount });
    } catch (err) {
      console.error('함께 기도해요 반응 반영 실패:', err);
      // 되돌려서 다시 누를 수 있게 한다 — 그대로 두면 카운트는 안 올랐는데
      // 버튼만 눌린 채 굳어버린다.
      unmarkReacted(prayer.id);
      setReacted(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button
      type="button"
      variant={reacted ? 'default' : 'outline'}
      size="sm"
      disabled={reacted}
      onClick={handleClick}
      aria-pressed={reacted}
      className={reacted ? 'bg-primary/15 text-primary-ink hover:bg-primary/15' : undefined}
    >
      <HeartHandshake className={reacted ? 'fill-current' : undefined} />
      함께 기도해요 {prayer.prayCount}
    </Button>
  );
}

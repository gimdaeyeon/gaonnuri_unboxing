import { useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import type { PrayerRequest } from '@/lib/types';
import { hasReacted, markReacted } from '@/lib/reacted-storage';
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
    markReacted(prayer.id);
    setReacted(true);
    try {
      const updated = await prayerRepository.incrementPrayCount(prayer.id);
      onReacted?.(updated);
    } catch (err) {
      console.error('함께 기도해요 반응 반영 실패:', err);
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

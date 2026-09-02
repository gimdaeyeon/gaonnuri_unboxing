import { useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import type { PrayerRequest } from '@/lib/types';
import { hasReacted, markReacted } from '@/lib/reacted-storage';
import { Button } from '@/components/ui/button';

interface PrayerReactionButtonProps {
  prayer: PrayerRequest;
  onReacted?: (updated: PrayerRequest) => void;
}

export function PrayerReactionButton({ prayer, onReacted }: PrayerReactionButtonProps) {
  const [reacted, setReacted] = useState(() => hasReacted(prayer.id));

  function handleClick() {
    if (reacted) return;
    // 아카이브 전환으로 서버가 없다 — 반응은 이 기기(localStorage)에만 남는다.
    // 저장은 reacted-storage가, 다음 방문 때 카운트 반영은 prayer-repository가
    // 맡으므로 여기서 실패할 게 없고, 예전의 롤백(unmarkReacted) 경로도 사라졌다.
    markReacted(prayer.id);
    setReacted(true);
    onReacted?.({ ...prayer, prayCount: prayer.prayCount + 1 });
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

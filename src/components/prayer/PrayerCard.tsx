import type { PrayerRequest } from '@/lib/types';
import { getDisplayName } from '@/lib/types';
import { PrayerReactionButton } from '@/components/prayer/PrayerReactionButton';

interface PrayerCardProps {
  prayer: PrayerRequest;
  onReacted?: (updated: PrayerRequest) => void;
}

export function PrayerCard({ prayer, onReacted }: PrayerCardProps) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-theme border border-border bg-surface p-5">
      <header className="flex items-center gap-2">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {prayer.cohort}또래
        </span>
        <span className="text-sm font-medium">{getDisplayName(prayer)}</span>
      </header>
      <p className="whitespace-pre-wrap break-keep text-[15px] leading-relaxed">
        {prayer.content}
      </p>
      <footer className="mt-auto pt-1">
        <PrayerReactionButton prayer={prayer} onReacted={onReacted} />
      </footer>
    </article>
  );
}

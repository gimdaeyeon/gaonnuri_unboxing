import { ChevronUp } from 'lucide-react';
import type { PrayerRequest } from '@/lib/types';
import { getDisplayName } from '@/lib/types';
import { PrayerReactionButton } from '@/components/prayer/PrayerReactionButton';

interface ReelsViewProps {
  prayers: PrayerRequest[];
  onReacted?: (updated: PrayerRequest) => void;
}

// 세로 풀스크린 스냅 스크롤. 부모가 화면 전체 높이를 갖는 컨테이너를 제공해야 한다.
export function ReelsView({ prayers, onReacted }: ReelsViewProps) {
  const total = prayers.length;

  return (
    <div className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain">
      {prayers.map((prayer, i) => (
        <section
          key={prayer.id}
          className="relative flex h-full snap-start flex-col items-center justify-center gap-8 px-8 py-20"
        >
          <p className="max-w-xl whitespace-pre-wrap break-keep text-center font-heading text-2xl leading-relaxed sm:text-3xl">
            {prayer.content}
          </p>
          <footer className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-text-muted">
              <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary-ink">
                {prayer.cohort}또래
              </span>
              <span className="text-sm font-medium">{getDisplayName(prayer)}</span>
            </div>
            <PrayerReactionButton prayer={prayer} onReacted={onReacted} />
          </footer>

          <span className="absolute bottom-6 right-6 text-sm tabular-nums text-text-muted">
            {i + 1} / {total}
          </span>
          {i === 0 && total > 1 && (
            <span className="absolute bottom-6 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center text-text-muted">
              <ChevronUp className="size-5" />
              <span className="text-xs">위로 스와이프</span>
            </span>
          )}
        </section>
      ))}
    </div>
  );
}

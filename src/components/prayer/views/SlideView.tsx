import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PrayerRequest } from '@/lib/types';
import { getDisplayName, PRAYER_CATEGORY_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PrayerReactionButton } from '@/components/prayer/PrayerReactionButton';

interface SlideViewProps {
  prayers: PrayerRequest[];
  onReacted?: (updated: PrayerRequest) => void;
}

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

export function SlideView({ prayers, onReacted }: SlideViewProps) {
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);
  const total = prayers.length;

  function paginate(dir: number) {
    setPage(([current]) => {
      const next = (current + dir + total) % total;
      return [next, dir];
    });
  }

  if (total === 0) return null;
  const prayer = prayers[index];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-xl overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.article
            key={prayer.id}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
                paginate(1);
              } else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) {
                paginate(-1);
              }
            }}
            className="flex min-h-96 cursor-grab flex-col justify-center gap-6 rounded-theme border border-border bg-surface p-8 active:cursor-grabbing sm:p-12"
          >
            <p className="whitespace-pre-wrap break-keep text-center font-heading text-xl leading-relaxed sm:text-2xl">
              {prayer.content}
            </p>
            <footer className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <span className="font-semibold text-primary">{prayer.cohort}또래</span>
                <span>{getDisplayName(prayer)}</span>
                {prayer.category && <span>· {PRAYER_CATEGORY_LABELS[prayer.category]}</span>}
              </div>
              <PrayerReactionButton prayer={prayer} onReacted={onReacted} />
            </footer>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="이전 기도제목"
          onClick={() => paginate(-1)}
        >
          <ChevronLeft />
        </Button>
        <span className="min-w-16 text-center text-sm tabular-nums text-text-muted">
          {index + 1} / {total}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="다음 기도제목"
          onClick={() => paginate(1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

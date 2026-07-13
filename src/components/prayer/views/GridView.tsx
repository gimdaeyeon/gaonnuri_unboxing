import type { PrayerRequest } from '@/lib/types';
import { PrayerCard } from '@/components/prayer/PrayerCard';

interface GridViewProps {
  prayers: PrayerRequest[];
  onReacted?: (updated: PrayerRequest) => void;
}

export function GridView({ prayers, onReacted }: GridViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {prayers.map((prayer) => (
        <PrayerCard key={prayer.id} prayer={prayer} onReacted={onReacted} />
      ))}
    </div>
  );
}

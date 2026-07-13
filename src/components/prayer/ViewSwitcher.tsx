export type PrayerViewMode = 'grid' | 'slide' | 'reels';

const VIEW_LABELS: Record<PrayerViewMode, string> = {
  grid: '그리드',
  slide: '슬라이드',
  reels: '릴스',
};

interface ViewSwitcherProps {
  value: PrayerViewMode;
  onChange: (mode: PrayerViewMode) => void;
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="보기 방식"
      className="inline-flex rounded-full border border-border bg-surface p-1"
    >
      {(Object.keys(VIEW_LABELS) as PrayerViewMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={value === mode}
          onClick={() => onChange(mode)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === mode
              ? 'bg-primary text-primary-foreground'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {VIEW_LABELS[mode]}
        </button>
      ))}
    </div>
  );
}

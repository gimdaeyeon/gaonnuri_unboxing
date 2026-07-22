import { motion } from 'framer-motion';

interface SquiggleSpec {
  d: string;
  color: string;
  top: string;
  left: string;
  size: number;
  duration: number;
}

const SQUIGGLES: SquiggleSpec[] = [
  {
    d: 'M0 12 C 10 0, 20 24, 30 12 S 50 0, 55 10',
    color: 'var(--color-theme-disciple)',
    top: '10%',
    left: '8%',
    size: 46,
    duration: 7,
  },
  {
    d: 'M0 10 C 12 -4, 18 24, 30 8',
    color: 'var(--color-theme-child)',
    top: '16%',
    left: '84%',
    size: 38,
    duration: 8.5,
  },
  {
    d: 'M0 14 C 14 0, 22 26, 34 10 S 50 -2, 58 12',
    color: 'var(--color-theme-salt)',
    top: '70%',
    left: '6%',
    size: 50,
    duration: 9,
  },
  {
    d: 'M0 8 C 10 -6, 20 20, 32 6',
    color: 'var(--color-theme-disciple)',
    top: '78%',
    left: '88%',
    size: 40,
    duration: 7.5,
  },
];

interface SquigglesProps {
  reducedMotion?: boolean;
}

// 배경에 떠다니는 낙서 스퀴글 — 시안의 손글씨 낙서 장식을 재현.
export function Squiggles({ reducedMotion }: SquigglesProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {SQUIGGLES.map((s, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 60 30"
          width={s.size}
          height={s.size / 2}
          className="absolute opacity-70"
          style={{ top: s.top, left: s.left }}
          animate={reducedMotion ? undefined : { y: [0, -8, 0], rotate: [0, 6, 0] }}
          transition={{ duration: s.duration, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d={s.d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" />
        </motion.svg>
      ))}
    </div>
  );
}

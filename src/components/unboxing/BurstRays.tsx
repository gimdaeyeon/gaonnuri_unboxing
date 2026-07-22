import { motion } from 'framer-motion';

interface BurstRaysProps {
  active: boolean;
  reducedMotion?: boolean;
  className?: string;
}

const RAY_COUNT = 14;
const COLORS = [
  'var(--color-text)',
  'var(--color-theme-disciple)',
  'var(--color-theme-child)',
  'var(--color-theme-salt)',
];

// 박스가 열리는 순간 입구 중심(160,116)에서 터지는 광선.
// 카드 위 레이어라서 남아 있으면 본문을 가린다 → 터졌다가 완전히 사라진다.
export function BurstRays({ active, reducedMotion, className }: BurstRaysProps) {
  if (reducedMotion) return null;

  return (
    <svg viewBox="0 0 320 250" className={className}>
      {Array.from({ length: RAY_COUNT }).map((_, i) => {
        const angle = (360 / RAY_COUNT) * i + (i % 2 === 0 ? 3 : -3);
        const length = 60 + ((i * 37) % 46);
        const color = COLORS[i % COLORS.length];
        return (
          <g key={i} transform={`translate(160 116) rotate(${angle})`}>
            <motion.line
              x1="0"
              y1="-16"
              x2="0"
              y2={-16 - length}
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transformOrigin: '0px -16px' }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={active ? { scaleY: [0, 1, 1], opacity: [0, 1, 0] } : { scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.6, delay: i * 0.02, ease: 'easeOut' }}
            />
          </g>
        );
      })}
    </svg>
  );
}

import { motion, type TargetAndTransition, type Transition } from 'framer-motion';

export type BoxPhase = 'closed' | 'shaking' | 'open';

interface BoxLayerProps {
  phase: BoxPhase;
  reducedMotion?: boolean;
  className?: string;
}

// ── 아이소메트릭(3/4 뷰) 택배박스 기하 ──────────────────────────────
// 입구 마름모: 중심 (160,116), 반너비 115, 반높이 42
//   L(45,116)  T(160,74)  R(275,116)  F(160,158)
// 몸통 높이 76 → 바닥 (45,192) (160,234) (275,192)
// 카드가 솟아오르는 클립선은 입구의 가장 넓은 선 y=116이다. 아래 Front
// 레이어의 조각들은 (닫힘 전용 뚜껑을 빼면) 전부 y≥116이라 그 선 위로
// 삐져나오지 않는다 — 그래야 카드 위에 박스 선이 겹쳐 보이지 않는다.
// 새 조각을 추가할 땐 이 규칙을 지킬 것. 좌표를 바꾸면 UnboxingPage의
// MOUTH_RATIO도 함께 고쳐야 한다.
const VIEW_BOX = '0 0 320 250';

const flapTransition = { duration: 0.45, ease: [0.16, 1, 0.3, 1] } as const;
const lidTransition = { duration: 0.2, ease: 'easeOut' } as const;

// 각 플랩은 경첩 변을 바깥으로 밀어낸 평행사변형. 펼쳐질 때
// 경첩 변의 중점을 transformOrigin 삼아 scale로 자라나게 한다
// (framer-motion은 points 문자열을 보간하지 못한다).
interface Flap {
  points: string;
  origin: string;
  delay: number;
}

const BACK_FLAPS: Flap[] = [
  { points: '45,116 160,74 120,59 5,101', origin: '102px 95px', delay: 0 },
  { points: '160,74 275,116 315,101 200,59', origin: '218px 95px', delay: 0.05 },
];

const FRONT_FLAPS: Flap[] = [
  { points: '45,116 160,158 120,173 5,131', origin: '102px 137px', delay: 0.1 },
  { points: '160,158 275,116 315,131 200,173', origin: '218px 137px', delay: 0.15 },
];

function FlapPolygon({ flap, isOpen }: { flap: Flap; isOpen: boolean }) {
  return (
    <motion.polygon
      points={flap.points}
      fill="var(--color-surface)"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
      style={{ transformOrigin: flap.origin }}
      animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.25 }}
      transition={{ ...flapTransition, delay: isOpen ? flap.delay : 0 }}
    />
  );
}

// 박스 뒤쪽 — 카드보다 아래(z-0)에 깔린다. 닫혀 있을 땐 전부 투명해서
// 앞 레이어의 뚜껑만 보인다.
export function UnboxingBoxBack({ phase, className }: BoxLayerProps) {
  const isOpen = phase === 'open';

  return (
    <svg viewBox={VIEW_BOX} className={className}>
      {/* 내부 어둠 — 열리면 드러나는 박스 안쪽 */}
      <motion.polygon
        points="45,116 160,74 275,116 160,158"
        fill="var(--color-box-inner)"
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={flapTransition}
      />
      {/* 뒤쪽 림 */}
      <motion.path
        d="M45 116 L160 74 L275 116"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={flapTransition}
      />
      {BACK_FLAPS.map((flap) => (
        <FlapPolygon key={flap.points} flap={flap} isOpen={isOpen} />
      ))}
    </svg>
  );
}

// 박스 앞쪽 — 카드보다 위(z-20). 앞쪽 림이 카드 아랫부분을 덮어
// "박스에 꽂혀 있는" 느낌을 만든다.
export function UnboxingBoxFront({ phase, reducedMotion, className }: BoxLayerProps) {
  const isOpen = phase === 'open';

  // 흔들림과 숨쉬기 펄스는 이 레이어에만 준다. 닫힌 상태에서는
  // 뒤 레이어가 전부 투명하므로 두 레이어가 어긋나 보일 일이 없다.
  let animate: TargetAndTransition = { rotate: 0, scale: 1 };
  let transition: Transition = { duration: 0.2 };
  if (!reducedMotion && phase === 'shaking') {
    animate = { rotate: [0, -3, 3, -2, 2, 0], scale: 1 };
    transition = { duration: 0.4 };
  } else if (!reducedMotion && phase === 'closed') {
    animate = { rotate: 0, scale: [1, 1.03, 1] };
    transition = { duration: 2, repeat: Infinity, ease: 'easeInOut' };
  }

  return (
    <motion.svg
      viewBox={VIEW_BOX}
      className={className}
      animate={animate}
      transition={transition}
    >
      {/* 몸통 3면 */}
      <path
        d="M45 116 L160 158 L275 116 L275 192 L160 234 L45 192 Z"
        fill="var(--color-surface)"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* 앞 세로 모서리 — 왼쪽면/오른쪽면을 갈라 입체감을 만든다 */}
      <path d="M160 158 L160 234" fill="none" stroke="currentColor" strokeWidth="3" />

      {FRONT_FLAPS.map((flap) => (
        <FlapPolygon key={flap.points} flap={flap} isOpen={isOpen} />
      ))}

      {/* 앞쪽 림 — 항상 보인다. 열렸을 때 카드 아랫변을 가리는 역할 */}
      <path
        d="M45 116 L160 158 L275 116"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* 닫힌 뚜껑 + 테이프 이음선 — 클립선 위로 올라오는 유일한 Front 조각이라
          카드가 솟아오르기(+260ms) 전에 완전히 사라지도록 빠르게 페이드한다. */}
      <motion.polygon
        points="45,116 160,74 275,116 160,158"
        fill="var(--color-surface)"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={lidTransition}
      />
      <motion.path
        d="M102 137 L217 95"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={{ opacity: isOpen ? 0 : 0.55 }}
        transition={lidTransition}
      />
    </motion.svg>
  );
}

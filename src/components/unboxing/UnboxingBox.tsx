import type { ReactNode } from 'react';
import { motion, type TargetAndTransition, type Transition } from 'framer-motion';

export type BoxPhase = 'closed' | 'open';

interface BoxLayerProps {
  phase: BoxPhase;
  shaking?: boolean;
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

// 흔들림(shaking)과 닫힘 상태의 숨쉬기 펄스는 앞/뒤 레이어가 항상 같은
// 값으로 회전해야 한 덩어리처럼 보인다 — 두 레이어 중 하나만 이 값을
// 쓰면 위쪽 뒤 플랩(날개)만 제자리에 남아 어긋나 보인다.
function useShakeAnimation(
  isOpen: boolean,
  shaking: boolean | undefined,
  reducedMotion: boolean | undefined,
): { animate: TargetAndTransition; transition: Transition } {
  if (!reducedMotion && shaking) {
    return {
      animate: { rotate: [0, -5, 4, -3, 2, 0], scale: 1 },
      transition: { duration: 0.42, ease: 'easeInOut' },
    };
  }
  if (!reducedMotion && !isOpen) {
    return {
      animate: { rotate: 0, scale: [1, 1.03, 1] },
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    };
  }
  return { animate: { rotate: 0, scale: 1 }, transition: { duration: 0.2 } };
}

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

// ── 옆면에 인쇄된 마크 (시안 표지의 FRAGILE·HANDLE 스탬프 + GAONNURI® 브랜드) ──
// 아이소메트릭 면 위에 얹으려면 면의 기울기만큼 눕혀야 진짜 인쇄된 것처럼 보인다.
// 왼쪽 면의 가로 방향은 (115,42), 오른쪽 면은 (115,-42)이므로 skewY ±atan(42/115).
// 마크는 면의 아래쪽(로컬 y 40 이하)에 둔다 — 위쪽은 열린 앞 플랩이 덮는 자리다.
// 시안대로 취급주의 스탬프 2개는 왼쪽 면에 나란히, 브랜드는 오른쪽 면에 둔다.
const FACE_SKEW = 20.06;
const STAMP_W = 52;
const STAMP_H = 20;
// 스탬프 두 개가 한 면(로컬 x 0~115)에 들어가야 해서 아이콘은 10×14로 그린 뒤
// 축소해 쓴다. 축소분만큼 stroke를 굵게 잡아야 선이 사라지지 않는다.
const ICON_SCALE = 0.7;

function FragileIcon() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0.5 0.5 L9.5 0.5 L5 7 Z" />
      <path d="M5 7 L5 12" />
      <path d="M1.5 13.5 L8.5 13.5" />
    </g>
  );
}

function GraceIcon() {
  return (
    <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M5 10 C1.5 7.5, 1.5 4.8, 3.3 4.8 C4.3 4.8, 5 5.7, 5 5.7 C5 5.7, 5.7 4.8, 6.7 4.8 C8.5 4.8, 8.5 7.5, 5 10 Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M0.5 11.5 Q5 15, 9.5 11.5" fill="none" />
    </g>
  );
}

function Stamp({ icon, line1, line2 }: { icon: ReactNode; line1: string; line2: string }) {
  return (
    <g>
      <rect
        width={STAMP_W}
        height={STAMP_H}
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
      />
      <path d={`M15 0 L15 ${STAMP_H}`} stroke="currentColor" strokeWidth="0.9" />
      <g transform={`translate(3.5 5) scale(${ICON_SCALE})`}>{icon}</g>
      <text className="font-accent" x="18" y="9" fontSize="4.4" fill="currentColor">
        {line1}
      </text>
      <text className="font-accent" x="18" y="16" fontSize="4.4" fill="currentColor">
        {line2}
      </text>
    </g>
  );
}

function BoxStamps() {
  return (
    <g opacity="0.72">
      {/* 왼쪽 면 — 취급주의 스탬프 2개를 나란히 */}
      <g transform={`translate(45 116) skewY(${FACE_SKEW}) translate(3 44)`}>
        <Stamp icon={<FragileIcon />} line1="FRAGILE" line2="STILL LOVED" />
      </g>
      <g transform={`translate(45 116) skewY(${FACE_SKEW}) translate(59 44)`}>
        <Stamp icon={<GraceIcon />} line1="HANDLE" line2="WITH GRACE" />
      </g>
      {/* 오른쪽 면 — 브랜드 마크. ®는 Silkscreen에 글리프가 없어 두부(▯)로
          떨어지므로 본문 폰트로 따로 빼서 작게 올려 붙인다. */}
      <g transform={`translate(160 158) skewY(${-FACE_SKEW}) translate(57.5 60)`}>
        <text
          className="font-accent"
          textAnchor="middle"
          fontSize="11"
          fill="currentColor"
          letterSpacing="0.5"
        >
          GAONNURI
          <tspan fontFamily="var(--font-body)" fontSize="5.5" dy="-4.5">
            ®
          </tspan>
        </text>
      </g>
    </g>
  );
}

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
export function UnboxingBoxBack({ phase, shaking, reducedMotion, className }: BoxLayerProps) {
  const isOpen = phase === 'open';
  const { animate, transition } = useShakeAnimation(isOpen, shaking, reducedMotion);

  return (
    <motion.svg viewBox={VIEW_BOX} className={className} animate={animate} transition={transition}>
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
    </motion.svg>
  );
}

// 박스 앞쪽 — 카드보다 위(z-20). 앞쪽 림이 카드 아랫부분을 덮어
// "박스에 꽂혀 있는" 느낌을 만든다.
export function UnboxingBoxFront({ phase, shaking, reducedMotion, className }: BoxLayerProps) {
  const isOpen = phase === 'open';

  // 뒤 레이어(UnboxingBoxBack)와 정확히 같은 회전/스케일을 써야 앞뒤가
  // 한 덩어리로 흔들린다 — 값이 어긋나면 위쪽 뒤 플랩(날개)만 제자리에
  // 남아있는 것처럼 보인다.
  const { animate, transition } = useShakeAnimation(isOpen, shaking, reducedMotion);

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

      <BoxStamps />

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

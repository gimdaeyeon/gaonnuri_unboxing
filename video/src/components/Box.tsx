// UnboxingBox를 영상용으로 옮긴 것. 기하(좌표·플랩 폴리곤·스탬프)는 원본
// src/components/unboxing/UnboxingBox.tsx와 완전히 동일하고, 구동부만 바꿨다 —
// Framer Motion은 시간 기반이라 프레임 단위로 렌더하는 Remotion에서는 같은
// 프레임이 매번 같은 그림을 내놓지 않는다. 그래서 모든 애니메이션을
// "열리기 시작한 뒤 몇 프레임 지났는가(t)"의 순수 함수로 다시 썼다.
import React from 'react';
import { Easing, interpolate } from 'remotion';
import { C, F } from '../tokens';

const VIEW_BOX = '0 0 320 250';

// 원본의 flapTransition(0.45s) / lidTransition(0.2s)을 30fps 프레임으로 환산
const FLAP_FRAMES = 13.5;
const LID_FRAMES = 6;
const FLAP_EASE = Easing.bezier(0.16, 1, 0.3, 1);

interface Flap {
  points: string;
  origin: string;
  delay: number; // 프레임
}

const BACK_FLAPS: Flap[] = [
  { points: '45,116 160,74 120,59 5,101', origin: '102px 95px', delay: 0 },
  { points: '160,74 275,116 315,101 200,59', origin: '218px 95px', delay: 1.5 },
];

const FRONT_FLAPS: Flap[] = [
  { points: '45,116 160,158 120,173 5,131', origin: '102px 137px', delay: 3 },
  { points: '160,158 275,116 315,131 200,173', origin: '218px 137px', delay: 4.5 },
];

function flapOpen(t: number, delay: number) {
  return interpolate(t - delay, [0, FLAP_FRAMES], [0, 1], {
    easing: FLAP_EASE,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function FlapPolygon({ flap, t }: { flap: Flap; t: number }) {
  const p = flapOpen(t, flap.delay);
  return (
    <polygon
      points={flap.points}
      fill={C.surface}
      stroke={C.text}
      strokeWidth="3"
      strokeLinejoin="round"
      opacity={p}
      style={{ transformOrigin: flap.origin, transform: `scale(${0.25 + 0.75 * p})` }}
    />
  );
}

// ── 옆면 인쇄 마크 (시안의 취급주의 스탬프 + 브랜드) ──
const FACE_SKEW = 20.06;
const STAMP_W = 52;
const STAMP_H = 20;
const ICON_SCALE = 0.7;

function FragileIcon() {
  return (
    <g fill="none" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0.5 0.5 L9.5 0.5 L5 7 Z" />
      <path d="M5 7 L5 12" />
      <path d="M1.5 13.5 L8.5 13.5" />
    </g>
  );
}

function GraceIcon() {
  return (
    <g stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M5 10 C1.5 7.5, 1.5 4.8, 3.3 4.8 C4.3 4.8, 5 5.7, 5 5.7 C5 5.7, 5.7 4.8, 6.7 4.8 C8.5 4.8, 8.5 7.5, 5 10 Z"
        fill={C.text}
        stroke="none"
      />
      <path d="M0.5 11.5 Q5 15, 9.5 11.5" fill="none" />
    </g>
  );
}

function Stamp({ icon, line1, line2 }: { icon: React.ReactNode; line1: string; line2: string }) {
  return (
    <g>
      <rect width={STAMP_W} height={STAMP_H} rx="2" fill="none" stroke={C.text} strokeWidth="0.9" />
      <path d={`M15 0 L15 ${STAMP_H}`} stroke={C.text} strokeWidth="0.9" />
      <g transform={`translate(3.5 5) scale(${ICON_SCALE})`}>{icon}</g>
      <text x="18" y="9" fontSize="4.4" fill={C.text} fontFamily={F.accent}>
        {line1}
      </text>
      <text x="18" y="16" fontSize="4.4" fill={C.text} fontFamily={F.accent}>
        {line2}
      </text>
    </g>
  );
}

function BoxStamps() {
  return (
    <g opacity="0.72">
      <g transform={`translate(45 116) skewY(${FACE_SKEW}) translate(3 44)`}>
        <Stamp icon={<FragileIcon />} line1="FRAGILE" line2="STILL LOVED" />
      </g>
      <g transform={`translate(45 116) skewY(${FACE_SKEW}) translate(59 44)`}>
        <Stamp icon={<GraceIcon />} line1="HANDLE" line2="WITH GRACE" />
      </g>
      <g transform={`translate(160 158) skewY(${-FACE_SKEW}) translate(57.5 60)`}>
        <text textAnchor="middle" fontSize="11" fill={C.text} fontFamily={F.accent} letterSpacing="0.5">
          GAONNURI
        </text>
      </g>
    </g>
  );
}

interface BoxProps {
  // 열리기 시작한 뒤 경과 프레임. 음수면 아직 닫혀 있다.
  t: number;
  style?: React.CSSProperties;
}

// 뒤쪽 레이어 — 카드보다 아래에 깔린다. 닫혀 있을 땐 전부 투명해 앞 뚜껑만 보인다.
export function BoxBack({ t, style }: BoxProps) {
  const open = flapOpen(t, 0);
  return (
    <svg viewBox={VIEW_BOX} style={style}>
      <polygon points="45,116 160,74 275,116 160,158" fill={C.boxInner} opacity={open} />
      <path
        d="M45 116 L160 74 L275 116"
        fill="none"
        stroke={C.text}
        strokeWidth="3"
        strokeLinejoin="round"
        opacity={open}
      />
      {BACK_FLAPS.map((flap) => (
        <FlapPolygon key={flap.points} flap={flap} t={t} />
      ))}
    </svg>
  );
}

// 앞쪽 레이어 — 카드보다 위. 앞쪽 림이 카드 아랫변을 덮어 "박스에 꽂힌" 느낌을 만든다.
export function BoxFront({ t, style }: BoxProps) {
  const lid = interpolate(t, [0, LID_FRAMES], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <svg viewBox={VIEW_BOX} style={style}>
      <path
        d="M45 116 L160 158 L275 116 L275 192 L160 234 L45 192 Z"
        fill={C.surface}
        stroke={C.text}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M160 158 L160 234" fill="none" stroke={C.text} strokeWidth="3" />

      <BoxStamps />

      {FRONT_FLAPS.map((flap) => (
        <FlapPolygon key={flap.points} flap={flap} t={t} />
      ))}

      <path
        d="M45 116 L160 158 L275 116"
        fill="none"
        stroke={C.text}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* 닫힌 뚜껑 + 테이프 이음선 — 클립선 위로 올라오는 유일한 앞 조각이라
          카드가 솟기 전에 완전히 사라져야 한다. */}
      <polygon
        points="45,116 160,74 275,116 160,158"
        fill={C.surface}
        stroke={C.text}
        strokeWidth="3"
        strokeLinejoin="round"
        opacity={lid}
      />
      <path d="M102 137 L217 95" fill="none" stroke={C.text} strokeWidth="2" opacity={lid * 0.55} />
    </svg>
  );
}

// 상자가 흔들리는 각도. 원본의 rotate 키프레임 [0,-5,4,-3,2,0] / 0.42s를 그대로 옮겼다.
export function shakeAngle(t: number) {
  if (t < 0 || t > 12.6) return 0;
  return interpolate(t, [0, 2.5, 5, 7.6, 10, 12.6], [0, -5, 4, -3, 2, 0], {
    easing: Easing.inOut(Easing.ease),
  });
}

// 닫혀 있을 때의 숨쉬기 펄스 (scale [1,1.03,1] / 2초 반복).
export function breathScale(frame: number) {
  const cycle = frame % 60;
  return interpolate(cycle, [0, 30, 60], [1, 1.03, 1], { easing: Easing.inOut(Easing.ease) });
}

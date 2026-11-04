// 장면들이 공유하는 조각 — 배경, 자막, 소제목.
// 자막은 항상 같은 자리(하단 고정)에 같은 크기로 나와야 시선이 튀지 않는다.
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, F } from '../tokens';

// 장면 안에서 t 프레임에 부드럽게 들어왔다 나가는 값.
export function fade(t: number, inFrames = 10, holdUntil = Infinity, outFrames = 10) {
  const fadeIn = interpolate(t, [0, inFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (holdUntil === Infinity) return fadeIn;
  const fadeOut = interpolate(t, [holdUntil, holdUntil + outFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.min(fadeIn, fadeOut);
}

// 아래에서 살짝 밀려 올라오며 나타나는 기본 등장 모션.
export function riseIn(t: number, delay = 0, distance = 40) {
  const p = interpolate(t - delay, [0, 18], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` };
}

export function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: C.bg,
        fontFamily: F.body,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

// 장면 상단의 소제목 — 지금 무엇을 보고 있는지 한 줄로 알려준다.
export function SceneTitle({ children, t = 0 }: { children: React.ReactNode; t?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 96,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 54,
        fontWeight: 800,
        color: C.text,
        letterSpacing: '-0.02em',
        ...riseIn(t, 0, 24),
      }}
    >
      {children}
    </div>
  );
}

// 하단 자막 — 음성이 없으므로 설명은 전부 여기서 진다.
export function Caption({ children, t = 0 }: { children: React.ReactNode; t?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 84,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 34,
        fontWeight: 500,
        color: C.textMuted,
        ...riseIn(t, 0, 20),
      }}
    >
      {children}
    </div>
  );
}

// 강조 낱말 — 자막 안에서 핵심 단어만 라임색으로 띄운다.
export function Hi({ children }: { children: React.ReactNode }) {
  return <span style={{ color: C.primary, fontWeight: 700 }}>{children}</span>;
}

// 배경에 떠다니는 낙서 스퀴글 (원본 Squiggles의 path를 그대로 사용).
const SQUIGGLES = [
  { d: 'M0 12 C 10 0, 20 24, 30 12 S 50 0, 55 10', color: C.disciple, top: '12%', left: '7%', size: 150, dur: 210 },
  { d: 'M0 10 C 12 -4, 18 24, 30 8', color: C.child, top: '18%', left: '86%', size: 120, dur: 255 },
  { d: 'M0 14 C 14 0, 22 26, 34 10 S 50 -2, 58 12', color: C.salt, top: '74%', left: '5%', size: 160, dur: 270 },
  { d: 'M0 8 C 10 -6, 20 20, 32 6', color: C.disciple, top: '80%', left: '89%', size: 130, dur: 225 },
];

export function Squiggles({
  opacity = 0.5,
  loopFrames,
}: {
  opacity?: number;
  /** 루프 영상에서 쓴다. 이 길이에 맞춰 떠다니는 주기를 맞춰 첫/끝 프레임을 같게 만든다. */
  loopFrames?: number;
}) {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {SQUIGGLES.map((s, i) => {
        // 느리게 위아래로 떠다닌다 — 정지 화면처럼 보이지 않게 하는 최소한의 움직임.
        const period = loopFrames ?? s.dur;
        const drift = Math.sin(((frame + i * 40) / period) * Math.PI * 2) * 16;
        return (
          <svg
            key={i}
            viewBox="0 0 60 30"
            width={s.size}
            height={s.size / 2}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              opacity,
              transform: `translateY(${drift}px)`,
            }}
          >
            <path d={s.d} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      })}
    </div>
  );
}

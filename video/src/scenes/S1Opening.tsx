// 0:00–0:04 오프닝 — 실제 사이트 제목과 같은 조각·색·회전값으로 조립된다.
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F } from '../tokens';
import { Caption, Squiggles, Stage, fade, riseIn } from '../components/Ui';

// src/pages/UnboxingPage.tsx의 TITLE_LETTERS와 동일한 조각·색·기울기.
const LETTERS = [
  { text: 'UN', color: C.disciple, rotate: -4, from: { x: -520, y: -200 } },
  { text: 'BOX', color: C.salt, rotate: 3, from: { x: 0, y: -420 } },
  { text: 'ING', color: C.child, rotate: -3, from: { x: 520, y: -200 } },
  { text: '!', color: C.text, rotate: 6, from: { x: 260, y: 380 } },
];

export function S1Opening() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Stage>
      <Squiggles opacity={fade(frame - 6, 24) * 0.55} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 34,
        }}
      >
        <div
          style={{
            fontFamily: F.accent,
            fontSize: 26,
            letterSpacing: '0.2em',
            color: C.textMuted,
            ...riseIn(frame, 0, 16),
          }}
        >
          2026 GAONNURI SUMMER RETREAT
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {LETTERS.map((l, i) => {
            // 조각마다 조금씩 늦게 날아와 한꺼번에 쿵 떨어지지 않고 조립되듯 붙는다.
            const p = spring({
              frame: frame - 10 - i * 5,
              fps,
              config: { damping: 14, stiffness: 120, mass: 0.9 },
            });
            return (
              <span
                key={l.text}
                style={{
                  display: 'inline-block',
                  fontSize: 190,
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: l.color,
                  opacity: p,
                  transform: [
                    `translate(${(1 - p) * l.from.x}px, ${(1 - p) * l.from.y}px)`,
                    `rotate(${l.rotate * p + (1 - p) * -25}deg)`,
                    `scale(${0.6 + 0.4 * p})`,
                  ].join(' '),
                }}
              >
                {l.text}
              </span>
            );
          })}
        </div>

        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: C.text,
            ...riseIn(frame, 38, 24),
          }}
        >
          수련회 기도제목 공유 웹서비스
        </div>
      </div>

      <Caption t={frame - 44}>기획 · 개발 · 운영 1인 프로젝트</Caption>
    </Stage>
  );
}

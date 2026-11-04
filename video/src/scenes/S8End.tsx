// 0:54–1:00 엔드카드 — 숫자 세 개만 남긴다. 채용담당자가 영상에서 가져갈 게
// 하나뿐이라면 "실제로 사람이 쓴 서비스였다"는 사실이어야 한다.
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F } from '../tokens';
import { Squiggles, Stage, fade, riseIn } from '../components/Ui';
import { STATS } from '../data';

const NUMBERS = [
  { value: STATS.prayers, label: '기도제목', color: C.disciple },
  { value: STATS.cohorts, label: '참여 또래', color: C.salt },
  { value: STATS.reactions, label: '함께 기도해요', color: C.child },
];

const STACK = 'React 19 · TypeScript · Vite · Tailwind CSS v4 · Supabase';

export function S8End() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Stage>
      <Squiggles opacity={0.45} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 70,
        }}
      >
        <div style={{ display: 'flex', gap: 120 }}>
          {NUMBERS.map((n, i) => {
            const appear = spring({
              frame: frame - 6 - i * 8,
              fps,
              config: { damping: 20, stiffness: 150 },
            });
            // 숫자가 올라가는 동안 눈이 머문다 — 결과값이 그냥 찍히는 것보다 오래 읽힌다.
            const shown = Math.round(
              interpolate(frame - 6 - i * 8, [0, 40], [0, n.value], {
                easing: Easing.out(Easing.cubic),
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            );
            return (
              <div
                key={n.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  opacity: appear,
                  transform: `translateY(${(1 - appear) * 40}px)`,
                }}
              >
                <span style={{ fontSize: 150, fontWeight: 900, color: n.color, letterSpacing: '-0.04em' }}>
                  {shown}
                </span>
                <span style={{ fontSize: 32, fontWeight: 600, color: C.textMuted }}>{n.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 30, color: C.textMuted, ...riseIn(frame - 44, 0, 20) }}>{STACK}</div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 74,
            fontWeight: 900,
            opacity: fade(frame - 58, 16),
          }}
        >
          <span style={{ color: C.disciple, transform: 'rotate(-4deg)', display: 'inline-block' }}>UN</span>
          <span style={{ color: C.salt, transform: 'rotate(3deg)', display: 'inline-block' }}>BOX</span>
          <span style={{ color: C.child, transform: 'rotate(-3deg)', display: 'inline-block' }}>ING</span>
          <span style={{ color: C.text, transform: 'rotate(6deg)', display: 'inline-block' }}>!</span>
        </div>

        <div
          style={{
            fontFamily: F.accent,
            fontSize: 24,
            letterSpacing: '0.18em',
            color: C.textMuted,
            opacity: fade(frame - 70, 16),
          }}
        >
          2026 GAONNURI SUMMER RETREAT
        </div>
      </div>
    </Stage>
  );
}

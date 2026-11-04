// 0:22–0:32 세 가지 보기 — 같은 데이터를 그리드/슬라이드/릴스로 바꿔 본다.
// 실제 앱의 ViewNav 세그먼트가 함께 전환되어 "어디를 보고 있는지"가 드러난다.
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../tokens';
import { Caption, SceneTitle, Stage } from '../components/Ui';
import { Card } from '../components/Card';
import { SHOWCASE } from '../data';

const PHASE = 75;
const VIEWS = ['그리드', '슬라이드', '릴스'] as const;

export function S4Views() {
  const frame = useCurrentFrame();
  const phase = Math.min(2, Math.floor(frame / PHASE));
  const t = frame - phase * PHASE;

  return (
    <Stage>
      <SceneTitle t={frame}>한 가지 데이터, 세 가지 방식</SceneTitle>
      <ViewNav active={phase} />

      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, bottom: 170 }}>
        {phase === 0 && <GridView t={t} />}
        {phase === 1 && <SlideView t={t} />}
        {phase === 2 && <ReelsView t={t} />}
      </div>

      <Caption t={frame - 10}>모아보기 안에서 보는 방식만 바꿉니다</Caption>
    </Stage>
  );
}

// 실제 ViewNav를 옮긴 세그먼트 컨트롤 — 활성 칸이 미끄러져 이동한다.
function ViewNav({ active }: { active: number }) {
  const segW = 200;
  const x = interpolate(active, [0, 1, 2], [0, segW, segW * 2], {
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <div
      style={{
        position: 'absolute',
        top: 196,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        padding: 6,
        borderRadius: 999,
        background: C.surface,
        border: `2px solid ${C.border}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          width: segW,
          height: 58,
          borderRadius: 999,
          background: C.primary,
          transform: `translateX(${x}px)`,
        }}
      />
      {VIEWS.map((v, i) => (
        <div
          key={v}
          style={{
            position: 'relative',
            width: segW,
            height: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 700,
            color: i === active ? C.bg : C.textMuted,
          }}
        >
          {v}
        </div>
      ))}
    </div>
  );
}

function GridView({ t }: { t: number }) {
  const { fps } = useVideoConfig();
  const items = SHOWCASE.slice(0, 6);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 460px)',
        gap: 28,
        justifyContent: 'center',
        alignContent: 'center',
        height: '100%',
      }}
    >
      {items.map((p, i) => {
        const s = spring({ frame: t - i * 4, fps, config: { damping: 18, stiffness: 150 } });
        return (
          <div key={p.id} style={{ opacity: s, transform: `scale(${0.88 + 0.12 * s})` }}>
            <Card prayer={p} width={460} compact />
          </div>
        );
      })}
    </div>
  );
}

function SlideView({ t }: { t: number }) {
  // 한 장씩 옆으로 넘어간다 — 양옆 카드가 살짝 보여 넘긴다는 게 드러난다.
  const step = interpolate(t, [8, 30, 38, 64], [0, 1, 1, 2], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const items = SHOWCASE.slice(0, 5);
  const SLOT = 860;

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {items.map((p, i) => {
        const offset = i - step;
        const x = 960 + offset * SLOT;
        const focused = Math.abs(offset) < 0.5;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: `translate(${x}px, -50%) translateX(-50%) scale(${focused ? 1 : 0.86})`,
              opacity: Math.abs(offset) > 1.6 ? 0 : focused ? 1 : 0.4,
            }}
          >
            <Card prayer={p} width={760} />
          </div>
        );
      })}
    </div>
  );
}

function ReelsView({ t }: { t: number }) {
  // 세로로 끊임없이 흘러간다 — 릴스처럼 계속 읽게 되는 느낌.
  const scroll = interpolate(t, [0, PHASE], [0, 860], { easing: Easing.inOut(Easing.cubic) });
  const items = SHOWCASE.slice(0, 6);
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 40,
          transform: `translateX(-50%) translateY(${-scroll}px)`,
          display: 'flex',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        {items.map((p) => (
          <Card key={p.id} prayer={p} width={720} compact />
        ))}
      </div>
      {/* 위아래 페이드 — 잘린 카드가 그대로 끊기지 않게 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(${C.bg} 0%, transparent 14%, transparent 86%, ${C.bg} 100%)`,
        }}
      />
    </div>
  );
}

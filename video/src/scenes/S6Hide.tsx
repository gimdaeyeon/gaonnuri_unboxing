// 0:38–0:46 숨기기 / 다시 보이기 — 왜 삭제를 안 열었는지 보여주는 장면.
// 누구나 쓰기가 가능한 구조에서 진짜 delete를 열면 남의 기도제목을 영구히
// 지울 수 있고 되돌릴 방법이 없다. 그래서 플래그만 세우고 관리자만 만진다.
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../tokens';
import { Caption, Hi, SceneTitle, Stage } from '../components/Ui';
import { Card } from '../components/Card';
import { SHOWCASE } from '../data';

const HIDE_AT = 34;
const RESTORE_AT = 108;

const TARGET = SHOWCASE[2] ?? SHOWCASE[0];

export function S6Hide() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0 = 공개, 1 = 숨김. 되돌아오는 길이 있다는 게 이 장면의 요점이라 양방향이다.
  const hidden = frame < RESTORE_AT
    ? spring({ frame: frame - HIDE_AT, fps, config: { damping: 22, stiffness: 170 } })
    : 1 - spring({ frame: frame - RESTORE_AT, fps, config: { damping: 22, stiffness: 170 } });

  const isHiding = frame >= HIDE_AT && frame < RESTORE_AT;

  return (
    <Stage>
      <SceneTitle t={frame}>지우지 않고, 내려둡니다</SceneTitle>

      <div
        style={{
          position: 'absolute',
          top: 300,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 34,
        }}
      >
        <div
          style={{
            opacity: 1 - hidden * 0.62,
            filter: `grayscale(${hidden})`,
            transform: `scale(${1 - hidden * 0.04})`,
          }}
        >
          <Card prayer={TARGET} width={900} hiddenChip={hidden > 0.5} />
        </div>

        <div style={{ display: 'flex', gap: 22 }}>
          <AdminButton
            label="숨기기"
            active={isHiding}
            pressedAt={HIDE_AT}
            frame={frame}
            icon={<EyeOff />}
          />
          <AdminButton
            label="다시 보이기"
            active={!isHiding && frame >= RESTORE_AT}
            pressedAt={RESTORE_AT}
            frame={frame}
            icon={<Eye />}
          />
        </div>

        {/* 실제로 DB에서 일어나는 일 — 행이 사라지는 게 아니라 플래그만 바뀐다. */}
        <div
          style={{
            fontFamily: "'Silkscreen', monospace",
            fontSize: 30,
            color: hidden > 0.5 ? C.accent : C.primary,
            border: `2px solid ${C.border}`,
            borderRadius: 10,
            padding: '14px 28px',
            background: C.surface,
          }}
        >
          is_del = {hidden > 0.5 ? 'true' : 'false'}
        </div>
      </div>

      <Caption t={frame - 8}>
        행을 지우지 않으니 <Hi>언제든 되돌릴 수 있습니다</Hi>
      </Caption>
    </Stage>
  );
}

function AdminButton({
  label,
  active,
  pressedAt,
  frame,
  icon,
}: {
  label: string;
  active: boolean;
  pressedAt: number;
  frame: number;
  icon: React.ReactNode;
}) {
  // 눌리는 순간만 살짝 눌러 실제 클릭처럼 보이게 한다.
  const press = interpolate(frame - pressedAt, [0, 4, 10], [1, 0.95, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '18px 34px',
        borderRadius: 10,
        fontSize: 28,
        fontWeight: 700,
        border: `2px solid ${active ? C.primary : C.border}`,
        background: active ? `color-mix(in srgb, ${C.primary} 15%, transparent)` : C.surface,
        color: active ? C.primary : C.textMuted,
        transform: `scale(${press})`,
      }}
    >
      {icon}
      {label}
    </div>
  );
}

function Eye() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12 S6 5, 12 5 S22 12, 22 12 S18 19, 12 19 S2 12, 2 12 Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12 S6 5, 12 5 S22 12, 22 12 S18 19, 12 19 S2 12, 2 12 Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
      <path d="M3 3 L21 21" strokeLinecap="round" />
    </svg>
  );
}

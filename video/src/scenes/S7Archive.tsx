// 0:46–0:54 아카이브 전환 — 만든 이야기가 아니라 '내린 이야기'.
// 서비스를 종료하는 대신 DB를 걷어내고 정적 스냅샷으로 바꾼 과정이라,
// 대부분의 포트폴리오가 다루지 않는 구간이다.
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F } from '../tokens';
import { Caption, Hi, SceneTitle, Stage, fade } from '../components/Ui';

const DETACH_AT = 32;
const JSON_AT = 68;
const MASK_AT = 102;

// 실명 대신 보편적인 예시 이름을 쓴다 — 실제 참가자 이름을 띄우면 마스킹한 의미가 없다.
const SAMPLE = '홍길동';
const MASKED = '홍00';

export function S7Archive() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // DB가 떨어져 나가 오른쪽으로 사라진다.
  const detach = spring({ frame: frame - DETACH_AT, fps, config: { damping: 24, stiffness: 90 } });
  const jsonIn = spring({ frame: frame - JSON_AT, fps, config: { damping: 18, stiffness: 140 } });

  return (
    <Stage>
      <SceneTitle t={frame}>수련회가 끝난 뒤</SceneTitle>

      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 0,
          right: 0,
          height: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 60,
        }}
      >
        <AppBox />

        {/* 연결선 — 끊기면서 점선 조각이 흩어진다 */}
        <div style={{ position: 'relative', width: 240, height: 6 }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const gone = interpolate(detach, [i * 0.12, i * 0.12 + 0.4], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: i * 40,
                  width: 28,
                  height: 6,
                  borderRadius: 3,
                  background: C.textMuted,
                  opacity: 1 - gone,
                  transform: `translateY(${gone * 70}px) rotate(${gone * 45}deg)`,
                }}
              />
            );
          })}
        </div>

        {/* 떨어져 나가는 DB 자리에 정적 스냅샷이 들어온다 */}
        <div style={{ position: 'relative', width: 300, height: 220 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 1 - detach,
              transform: `translateX(${detach * 260}px) rotate(${detach * 14}deg)`,
            }}
          >
            <DbCylinder />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: jsonIn,
              transform: `scale(${0.7 + 0.3 * jsonIn})`,
            }}
          >
            <JsonFile />
          </div>
        </div>
      </div>

      {/* 이름 마스킹 — 글자가 하나씩 0으로 바뀐다 */}
      <div
        style={{
          position: 'absolute',
          top: 640,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          opacity: fade(frame - MASK_AT, 14),
        }}
      >
        <MaskingName t={frame - MASK_AT} />
      </div>

      <Caption t={frame - 8}>
        DB를 걷어내고 <Hi>읽기 전용 기록</Hi>으로 남겼습니다
      </Caption>
    </Stage>
  );
}

function MaskingName({ t }: { t: number }) {
  // 왼쪽은 원래 이름, 오른쪽은 한 박자 뒤에 나타난다 — 둘을 처음부터 같이 띄우면
  // '바뀌었다'가 아니라 '두 글자가 나란히 있다'로만 읽힌다.
  const reveal = interpolate(t - 24, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 34, fontSize: 64, fontWeight: 800 }}>
      <span style={{ color: C.textMuted }}>{SAMPLE}</span>
      <span style={{ fontSize: 40, color: C.border, opacity: reveal }}>→</span>
      <span
        style={{
          display: 'inline-block',
          color: C.accent,
          opacity: reveal,
          transform: `scale(${0.82 + 0.18 * reveal})`,
        }}
      >
        {MASKED}
      </span>
    </div>
  );
}

function AppBox() {
  return (
    <div
      style={{
        width: 300,
        height: 220,
        borderRadius: 14,
        border: `3px solid ${C.border}`,
        background: C.surface,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      <span style={{ fontFamily: F.accent, fontSize: 32, color: C.primary }}>UNBOXING</span>
      <span style={{ fontSize: 22, color: C.textMuted }}>정적 사이트</span>
    </div>
  );
}

function DbCylinder() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width="150" height="170" viewBox="0 0 100 116">
        <ellipse cx="50" cy="18" rx="40" ry="15" fill={C.surface} stroke={C.textMuted} strokeWidth="4" />
        <path d="M10 18 V92" stroke={C.textMuted} strokeWidth="4" fill="none" />
        <path d="M90 18 V92" stroke={C.textMuted} strokeWidth="4" fill="none" />
        <ellipse cx="50" cy="55" rx="40" ry="15" fill="none" stroke={C.textMuted} strokeWidth="4" />
        <ellipse cx="50" cy="92" rx="40" ry="15" fill="none" stroke={C.textMuted} strokeWidth="4" />
      </svg>
      <span style={{ fontSize: 24, color: C.textMuted }}>Supabase</span>
    </div>
  );
}

function JsonFile() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width="150" height="170" viewBox="0 0 100 116">
        <path
          d="M18 6 H62 L84 30 V110 H18 Z"
          fill={C.surface}
          stroke={C.primary}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M62 6 V30 H84" fill="none" stroke={C.primary} strokeWidth="4" strokeLinejoin="round" />
        <text x="51" y="80" textAnchor="middle" fontSize="24" fill={C.primary} fontFamily={F.accent}>
          {'{ }'}
        </text>
      </svg>
      <span style={{ fontSize: 24, color: C.primary }}>prayers.json</span>
    </div>
  );
}

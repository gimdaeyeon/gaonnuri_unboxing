// 0:32–0:38 내 기도제목 찾기 — 또래 + 이름이 곧 식별 키다(로그인이 없으므로).
// 여기 쓰는 인물은 실제 참가자가 아니라 데모다. 아카이브에서 실명을 지운 마당에
// 영상에서 진짜 이름을 타이핑해 보여주면 마스킹한 의미가 없어진다.
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../tokens';
import { Caption, Hi, SceneTitle, Stage } from '../components/Ui';
import { Card } from '../components/Card';
import type { Prayer } from '../data';

const DEMO: Prayer = {
  id: 'demo-find',
  authorName: '홍0',
  cohort: '99',
  isAnonymous: false,
  content: '올 한 해 마음이 지치지 않게, 곁에 있는 사람들을 더 아끼게 해주세요.',
  prayCount: 4,
  createdAt: '2026-07-26T00:00:00Z',
  updatedAt: '2026-07-26T00:00:00Z',
};

const COHORT = '99';
const NAME = '홍길동';
const TYPE_START = 10;
const NAME_START = 30;
const SUBMIT_AT = 62;

// 한 글자씩 찍히는 타이핑 — 사람이 직접 입력하는 장면이라는 걸 보여준다.
function typed(text: string, t: number, perChar = 8) {
  const n = Math.floor(interpolate(t, [0, text.length * perChar], [0, text.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));
  return text.slice(0, n);
}

export function S5Find() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cohortText = typed(COHORT, frame - TYPE_START);
  const nameText = typed(NAME, frame - NAME_START);
  const pressed = frame >= SUBMIT_AT && frame < SUBMIT_AT + 8;
  const result = spring({
    frame: frame - SUBMIT_AT - 10,
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  return (
    <Stage>
      <SceneTitle t={frame}>로그인 없이, 또래와 이름으로</SceneTitle>

      <div
        style={{
          position: 'absolute',
          top: 280,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
        }}
      >
        <div style={{ display: 'flex', gap: 26 }}>
          <Field label="또래" value={cohortText} width={240} active={frame >= TYPE_START && frame < NAME_START} />
          <Field label="이름" value={nameText} width={634} active={frame >= NAME_START && frame < SUBMIT_AT} />
        </div>

        <div
          style={{
            height: 82,
            borderRadius: 10,
            background: C.primary,
            color: C.bg,
            fontSize: 30,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${pressed ? 0.97 : 1})`,
          }}
        >
          내 기도제목 찾기
        </div>

        <div
          style={{
            marginTop: 14,
            opacity: result,
            transform: `translateY(${(1 - result) * 40}px)`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Card prayer={DEMO} width={900} />
        </div>
      </div>

      <Caption t={frame - 8}>
        인증 없는 교회 내부용 — <Hi>또래와 이름</Hi>이 곧 식별 키입니다
      </Caption>
    </Stage>
  );
}

function Field({
  label,
  value,
  width,
  active,
}: {
  label: string;
  value: string;
  width: number;
  active: boolean;
}) {
  const frame = useCurrentFrame();
  // 커서는 실제 입력창처럼 깜빡인다.
  const caret = active && Math.floor(frame / 8) % 2 === 0;
  return (
    <div style={{ width, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 24, fontWeight: 600, color: C.textMuted }}>{label}</span>
      <div
        style={{
          height: 82,
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px',
          borderRadius: 10,
          background: C.surface,
          border: `2px solid ${active ? C.primary : C.border}`,
          fontSize: 30,
          color: C.text,
        }}
      >
        {value}
        {caret && <span style={{ marginLeft: 2, color: C.primary }}>|</span>}
      </div>
    </div>
  );
}

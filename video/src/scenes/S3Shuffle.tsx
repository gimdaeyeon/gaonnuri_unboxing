// 0:12–0:22 가중치 셔플 — 이 영상에서 가장 중요한 장면.
// 화면만 녹화해서는 절대 보이지 않는 판단(노출 순서 설계)을 눈에 보이게 만든다.
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F } from '../tokens';
import { Caption, Hi, SceneTitle, Stage, fade, riseIn } from '../components/Ui';
import { SHOWCASE, STATS } from '../data';
import { themeColorForId } from '../components/Card';

const TILE_W = 190;
const GAP = 24;
const COUNT = 8;

const REORDER_AT = 46;
const REORDER_DUR = 46;
const FORMULA_AT = 108;
const ROW_OUT_AT = 146;
const STAT_AT = 162;

// 반응 수가 고르게 퍼진 8건을 골라 정렬 효과가 눈에 보이게 한다.
const PICKS = [...SHOWCASE]
  .slice(0, COUNT)
  .map((p, i) => ({ ...p, prayCount: [6, 1, 4, 0, 8, 2, 7, 3][i] ?? p.prayCount }));

const SORTED = [...PICKS].sort((a, b) => a.prayCount - b.prayCount);

export function S3Shuffle() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rowWidth = COUNT * TILE_W + (COUNT - 1) * GAP;
  const startX = (1920 - rowWidth) / 2;

  const reorder = interpolate(frame - REORDER_AT, [0, REORDER_DUR], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 통계가 올라올 때 카드 줄은 뒤로 물러난다 — 두 정보가 동시에 시선을 다투지 않게.
  const rowFade = fade(frame, 12, ROW_OUT_AT, 14);

  return (
    <Stage>
      <SceneTitle t={frame}>모두의 기도제목이 읽히게 하려면</SceneTitle>

      <div style={{ position: 'absolute', top: 400, left: 0, right: 0, height: 200, opacity: rowFade }}>
        {PICKS.map((p, i) => {
          const targetIndex = SORTED.findIndex((s) => s.id === p.id);
          const x = interpolate(reorder, [0, 1], [
            startX + i * (TILE_W + GAP),
            startX + targetIndex * (TILE_W + GAP),
          ]);
          // 아무도 안 읽은 카드(0회)를 라임으로 띄워 어디로 가는지 눈이 따라가게 한다.
          const isNeglected = p.prayCount <= 1;
          const appear = spring({ frame: frame - i * 3, fps, config: { damping: 18, stiffness: 140 } });

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: TILE_W,
                transform: `translateX(${x}px) translateY(${(1 - appear) * 50}px)`,
                opacity: appear,
              }}
            >
              <Tile prayer={p} highlight={isNeglected && reorder > 0.15} />
            </div>
          );
        })}
      </div>

      {/* 가중치 식 — 말로 길게 설명하는 대신 한 줄로 보여준다. */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: fade(frame - FORMULA_AT, 14, ROW_OUT_AT - FORMULA_AT - 6, 14),
        }}
      >
        <span
          style={{
            fontFamily: F.accent,
            fontSize: 40,
            color: C.primary,
            border: `2px solid ${C.border}`,
            borderRadius: 12,
            padding: '16px 34px',
            background: C.surface,
          }}
        >
          weight = 1 / (reactions + 1)
        </span>
      </div>

      {/* 결과 — 설계가 통했다는 증거. 이 장면의 결론이다. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          ...riseIn(frame - STAT_AT, 0, 36),
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 600, color: C.textMuted }}>운영 종료 시점</div>
        <div style={{ fontSize: 104, fontWeight: 900, color: C.primary, letterSpacing: '-0.03em' }}>
          {STATS.prayers}건 모두 읽혔습니다
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, color: C.text }}>
          반응 0건인 기도제목 <Hi>{STATS.unread}개</Hi>
        </div>
      </div>

      <Caption t={frame - 22}>
        {frame < FORMULA_AT ? (
          <>단순 랜덤이면 끝까지 아무도 못 읽는 기도제목이 남습니다</>
        ) : (
          <>반응이 적을수록 앞에 나올 확률을 높였습니다</>
        )}
      </Caption>
    </Stage>
  );
}

// 카드 한 장을 줄에 세울 수 있게 압축한 타일 — 또래와 반응 수만 남긴다.
function Tile({ prayer, highlight }: { prayer: (typeof PICKS)[number]; highlight: boolean }) {
  const color = themeColorForId(prayer.id);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        padding: '26px 16px',
        borderRadius: 12,
        background: C.surface,
        border: `2px solid ${highlight ? C.primary : C.border}`,
        boxShadow: highlight ? `0 0 42px ${C.primary}44` : 'none',
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{prayer.cohort}또래</span>
      <span
        style={{
          fontSize: 54,
          fontWeight: 900,
          color: highlight ? C.primary : C.text,
        }}
      >
        {prayer.prayCount}
      </span>
      <span style={{ fontSize: 18, color: C.textMuted }}>반응</span>
    </div>
  );
}

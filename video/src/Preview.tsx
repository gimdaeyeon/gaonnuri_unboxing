// 포트폴리오 카드 hover 미리보기 (1200x750, 6초 루프).
// 본편(Video.tsx)과 목적이 다릅니다. 설명하는 영상이 아니라 커서가 스치는 순간
// "아, 이런 거구나" 가 오게 하는 용도라, 자막도 인트로도 없이 이 서비스에서 가장
// 이 서비스다운 동작 하나만 보여줍니다 - 박스를 열면 기도제목이 솟아오르는 것.
//
// 마지막 프레임이 첫 프레임과 같은 상태(닫힌 박스)라 이어 붙여도 끊기지 않습니다.
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BoxBack, BoxFront, breathScale, shakeAngle } from './components/Box';
import { Rays } from './components/Rays';
import { Card } from './components/Card';
import { Squiggles } from './components/Ui';
import { C } from './tokens';
import { SHOWCASE } from './data';

export const PREVIEW_W = 1200;
export const PREVIEW_H = 750;
export const PREVIEW_FRAMES = 180; // 30fps 기준 6초

const BOX_W = 500;
const BOX_H = (BOX_W * 250) / 320;
const MOUTH_FROM_BOTTOM = BOX_H - (116 / 250) * BOX_H;

const SHAKE_AT = 14;
const OPEN_AT = 28;
const CARD_AT = 33;
const CARD_DROP_AT = 122;
const CLOSE_AT = 138;
// 이 프레임에 완전히 닫힙니다. 마지막 20여 프레임을 닫힌 채로 남겨,
// 끝 프레임과 첫 프레임이 같은 그림이 되게 합니다.
const CLOSE_END = 164;
// 플랩 delay(최대 4.5) + 펼침(13.5) 을 더한 값. 이 t 이상이면 완전히 열린 상태입니다.
const FULLY_OPEN_T = 18;

// 작은 화면에 들어가야 하므로 가장 짧은 기도제목을 고릅니다.
const PICK = [...SHOWCASE].sort((a, b) => a.content.length - b.content.length)[0];

export function UnboxingPreview() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 열렸다가 다시 닫히는 한 바퀴. Box 컴포넌트는 "열린 뒤 경과 프레임" 하나만
  // 받으므로, 닫을 때는 그 값을 거꾸로 내려주면 그대로 되감깁니다.
  const boxT =
    frame < CLOSE_AT
      ? frame - OPEN_AT
      : interpolate(frame, [CLOSE_AT, CLOSE_END], [FULLY_OPEN_T, -6], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  const angle = shakeAngle(frame - SHAKE_AT);
  const scale = frame < SHAKE_AT ? breathScale(frame) : 1;
  const boxTransform = `rotate(${angle}deg) scale(${scale})`;

  const rise = spring({
    frame: frame - CARD_AT,
    fps,
    config: { damping: 20, stiffness: 300, mass: 0.7 },
  });
  const drop = spring({
    frame: frame - CARD_DROP_AT,
    fps,
    config: { damping: 26, stiffness: 240 },
  });
  const cardUp = rise * (1 - drop);

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden' }}>
      <Squiggles opacity={0.35} loopFrames={PREVIEW_FRAMES} />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 104,
          width: BOX_W,
          height: BOX_H + 250,
          transform: 'translateX(-50%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: boxTransform,
            transformOrigin: 'bottom center',
          }}
        >
          <BoxBack t={boxT} style={{ position: 'absolute', bottom: 0, width: BOX_W, height: BOX_H }} />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: MOUTH_FROM_BOTTOM + 10,
            left: -70,
            right: -70,
            height: 250,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              transformOrigin: 'bottom center',
              transform: `translateY(${(1 - cardUp) * 120}%) scale(${0.35 + 0.65 * cardUp})`,
            }}
          >
            <Card prayer={PICK} width={580} compact />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: boxTransform,
            transformOrigin: 'bottom center',
          }}
        >
          <BoxFront t={boxT} style={{ position: 'absolute', bottom: 0, width: BOX_W, height: BOX_H }} />
          <Rays t={frame - OPEN_AT} style={{ position: 'absolute', bottom: 0, width: BOX_W, height: BOX_H }} />
        </div>
      </div>
    </div>
  );
}

// 0:04–0:12 핵심 인터랙션 — 이 서비스의 정체성. 흔들림 → 열림 → 광선 → 카드가
// 상자 안에서 솟아오르는 순서는 실제 UnboxingPage의 draw() 타이밍을 그대로 옮겼다.
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BoxBack, BoxFront, breathScale, shakeAngle } from '../components/Box';
import { Rays } from '../components/Rays';
import { Card } from '../components/Card';
import { Caption, Hi, Squiggles, Stage } from '../components/Ui';
import { HERO } from '../data';

const BOX_W = 720;
const BOX_H = (BOX_W * 250) / 320;
// 입구(가장 넓은 선)는 viewBox의 y=116 — 카드는 이 선에서 솟아오른다.
const MOUTH_FROM_BOTTOM = BOX_H - (116 / 250) * BOX_H;

const SHAKE_AT = 26;
const OPEN_AT = 40;
const RAYS_AT = 40;
const CARD_AT = 45;

export function S2Unbox() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isOpen = frame >= OPEN_AT;
  const angle = shakeAngle(frame - SHAKE_AT);
  // 닫혀 있는 동안만 숨쉬기 펄스 — 열린 뒤엔 카드에 시선이 가야 한다.
  const scale = isOpen || frame >= SHAKE_AT ? 1 : breathScale(frame);
  const boxTransform = `rotate(${angle}deg) scale(${scale})`;

  const cardRise = spring({
    frame: frame - CARD_AT,
    fps,
    // 실제 카드 등장과 같은 스프링 — 살짝 오버슈트하며 탄력있게 솟는다.
    config: { damping: 20, stiffness: 300, mass: 0.7 },
  });

  return (
    <Stage>
      <Squiggles opacity={0.4} />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 190,
          width: BOX_W,
          height: BOX_H + 300,
          transform: 'translateX(-50%)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, transform: boxTransform, transformOrigin: 'bottom center' }}>
          <BoxBack
            t={frame - OPEN_AT}
            style={{ position: 'absolute', bottom: 0, width: BOX_W, height: BOX_H }}
          />
        </div>

        {/* 카드 우물 — 하단 경계가 곧 박스 입구. 넘치는 부분을 잘라내야
            카드가 상자 안에서 나오는 것처럼 보인다. */}
        <div
          style={{
            position: 'absolute',
            bottom: MOUTH_FROM_BOTTOM + 16,
            left: -60,
            right: -60,
            height: 300,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              transformOrigin: 'bottom center',
              transform: `translateY(${(1 - cardRise) * 120}%) scale(${0.35 + 0.65 * cardRise})`,
            }}
          >
            <Card prayer={HERO} width={700} />
          </div>
        </div>

        <div style={{ position: 'absolute', inset: 0, transform: boxTransform, transformOrigin: 'bottom center' }}>
          <BoxFront
            t={frame - OPEN_AT}
            style={{ position: 'absolute', bottom: 0, width: BOX_W, height: BOX_H }}
          />
          <Rays
            t={frame - RAYS_AT}
            style={{ position: 'absolute', bottom: 0, width: BOX_W, height: BOX_H }}
          />
        </div>
      </div>

      <Caption t={frame - 8}>
        박스를 열면 <Hi>누군가의 기도제목</Hi>이 나옵니다
      </Caption>
    </Stage>
  );
}

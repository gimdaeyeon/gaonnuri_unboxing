// 전체 타임라인. 장면 길이를 바꾸려면 아래 CHAPTERS의 duration만 고치면 된다 —
// 시작 프레임(from)은 앞 장면들의 길이를 더해 자동으로 정해지므로, 한 장면을
// 줄였을 때 뒤 장면들을 일일이 밀어줄 필요가 없다.
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Sequence, continueRender, delayRender, interpolate, useCurrentFrame } from 'remotion';
import 'pretendard/dist/web/static/pretendard.css';
import '@fontsource/silkscreen/400.css';

import { C } from './tokens';
import { S1Opening } from './scenes/S1Opening';
import { S2Unbox } from './scenes/S2Unbox';
import { S3Shuffle } from './scenes/S3Shuffle';
import { S4Views } from './scenes/S4Views';
import { S5Find } from './scenes/S5Find';
import { S6Hide } from './scenes/S6Hide';
import { S7Archive } from './scenes/S7Archive';
import { S8End } from './scenes/S8End';

const FADE = 8;

const DEFS = [
  { name: '오프닝', duration: 100, Component: S1Opening },
  { name: '언박싱', duration: 175, Component: S2Unbox },
  { name: '가중치 셔플', duration: 225, Component: S3Shuffle },
  { name: '세 가지 보기', duration: 225, Component: S4Views },
  { name: '내 기도제목 찾기', duration: 145, Component: S5Find },
  { name: '숨기기와 복원', duration: 180, Component: S6Hide },
  { name: '아카이브 전환', duration: 180, Component: S7Archive },
  { name: '엔드카드', duration: 140, Component: S8End },
];

let cursor = 0;
export const CHAPTERS = DEFS.map((def) => {
  const from = cursor;
  cursor += def.duration;
  return { ...def, from };
});

export const TOTAL_FRAMES = cursor;

export function UnboxingVideo() {
  // 폰트가 올라오기 전에 프레임이 찍히면 첫 장면만 기본 글꼴로 렌더된다.
  // 다 불러올 때까지 렌더를 붙잡아 둔다.
  const [handle] = useState(() => delayRender('폰트 로딩'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('900 100px Pretendard'),
      document.fonts.load('600 100px Pretendard'),
      document.fonts.load('400 100px Silkscreen'),
    ])
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {CHAPTERS.map(({ name, from, duration, Component }, i) => {
        // 첫 장면을 뺀 나머지는 FADE만큼 일찍 시작해 앞 장면의 퇴장과 겹친다.
        // 겹치지 않으면 앞 장면이 완전히 사라진 뒤에야 다음 장면이 나타나서
        // 전환마다 검은 화면이 끼어들고, 다음 장면을 기다리는 느낌이 난다.
        const overlap = i === 0 ? 0 : FADE;
        return (
          <Sequence
            key={name}
            from={from - overlap}
            durationInFrames={duration + overlap}
            name={name}
          >
            <CrossFade duration={duration + overlap}>
              <Component />
            </CrossFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

// 장면 안쪽 기준으로 앞뒤를 눌러준다 — 각 장면은 자기 로컬 프레임만 알면 되고,
// 전환은 전부 여기서 책임진다.
function CrossFade({ duration, children }: { duration: number; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(frame, [0, FADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    interpolate(frame, [duration - FADE, duration], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
}

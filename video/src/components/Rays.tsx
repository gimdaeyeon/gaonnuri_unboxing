// BurstRays를 영상용으로 옮긴 것 — 각도·길이·색 순환은 원본과 동일하고,
// 시간 기반 키프레임만 프레임 함수로 바꿨다.
import React from 'react';
import { Easing, interpolate } from 'remotion';
import { C } from '../tokens';

const RAY_COUNT = 14;
const COLORS = [C.text, C.disciple, C.child, C.salt];
const BURST_FRAMES = 18; // 원본 0.6s

interface RaysProps {
  // 터지기 시작한 뒤 경과 프레임.
  t: number;
  style?: React.CSSProperties;
}

export function Rays({ t, style }: RaysProps) {
  if (t < 0) return null;

  return (
    <svg viewBox="0 0 320 250" style={style}>
      {Array.from({ length: RAY_COUNT }).map((_, i) => {
        const angle = (360 / RAY_COUNT) * i + (i % 2 === 0 ? 3 : -3);
        const length = 60 + ((i * 37) % 46);
        const color = COLORS[i % COLORS.length];
        // 광선마다 조금씩 늦게 출발해 한 번에 퍽 터지지 않고 번지듯 퍼진다.
        const lt = t - i * 0.6;
        const scaleY = interpolate(lt, [0, BURST_FRAMES * 0.45, BURST_FRAMES], [0, 1, 1], {
          easing: Easing.out(Easing.ease),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        // 카드 위 레이어라 남아 있으면 본문을 가린다 → 끝에서 완전히 사라진다.
        const opacity = interpolate(lt, [0, BURST_FRAMES * 0.4, BURST_FRAMES], [0, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <g key={i} transform={`translate(160 116) rotate(${angle})`}>
            <line
              x1="0"
              y1="-16"
              x2="0"
              y2={-16 - length}
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              opacity={opacity}
              style={{ transformOrigin: '0px -16px', transform: `scaleY(${scaleY})` }}
            />
          </g>
        );
      })}
    </svg>
  );
}

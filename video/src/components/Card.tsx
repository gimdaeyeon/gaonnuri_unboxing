// 실제 PrayerCard/언박싱 카드의 생김새를 영상 해상도(1080p)에 맞춰 옮긴 것.
// 또래 배지 색을 id 해시로 고르는 규칙까지 원본(UnboxingPage.themeColorForId)과
// 같게 맞췄다 — 같은 기도제목이 서비스와 영상에서 다른 색으로 보이면 안 되니까.
import React from 'react';
import { C, F } from '../tokens';
import { displayName, type Prayer } from '../data';

const THEME_COLORS = [C.child, C.disciple, C.salt];

export function themeColorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return THEME_COLORS[Math.abs(hash) % THEME_COLORS.length];
}

interface CardProps {
  prayer: Prayer;
  width?: number;
  // 반응 수를 덮어쓰고 싶을 때 (가중치 셔플 장면에서 사용)
  count?: number;
  reacted?: boolean;
  dimmed?: boolean;
  hiddenChip?: boolean;
  compact?: boolean;
  style?: React.CSSProperties;
}

export function Card({
  prayer,
  width = 520,
  count,
  reacted = false,
  dimmed = false,
  hiddenChip = false,
  compact = false,
  style,
}: CardProps) {
  const color = themeColorForId(prayer.id);
  const prayCount = count ?? prayer.prayCount;

  return (
    <div
      style={{
        width,
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 14 : 20,
        padding: compact ? '26px 28px' : '34px 38px',
        borderRadius: 12,
        border: `2px solid ${C.border}`,
        background: C.surface,
        fontFamily: F.body,
        opacity: dimmed ? 0.35 : 1,
        filter: dimmed ? 'grayscale(1)' : 'none',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span
          style={{
            borderRadius: 999,
            padding: '7px 18px',
            fontSize: compact ? 20 : 24,
            fontWeight: 700,
            color,
            background: `color-mix(in srgb, ${color} 18%, transparent)`,
          }}
        >
          {prayer.cohort}또래
        </span>
        <span style={{ fontSize: compact ? 20 : 24, fontWeight: 500, color: C.text }}>
          {displayName(prayer)}
        </span>
        {hiddenChip && (
          <span
            style={{
              marginLeft: 'auto',
              borderRadius: 999,
              padding: '6px 16px',
              fontSize: 19,
              fontWeight: 700,
              color: C.bg,
              background: C.textMuted,
            }}
          >
            숨김
          </span>
        )}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: compact ? 25 : 31,
          lineHeight: 1.55,
          color: C.text,
          wordBreak: 'keep-all',
        }}
      >
        {prayer.content}
      </p>

      <div
        style={{
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderRadius: 10,
          padding: compact ? '9px 18px' : '12px 22px',
          fontSize: compact ? 19 : 23,
          fontWeight: 600,
          border: `2px solid ${reacted ? 'transparent' : C.border}`,
          background: reacted ? `color-mix(in srgb, ${C.primary} 15%, transparent)` : 'transparent',
          color: reacted ? C.primary : C.textMuted,
        }}
      >
        <HeartHands filled={reacted} />
        함께 기도해요 {prayCount}
      </div>
    </div>
  );
}

// lucide의 HeartHandshake을 단순화해 옮긴 아이콘.
function HeartHands({ filled }: { filled: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M12 20.5 C6 16.5, 3.5 13, 3.5 9.5 C3.5 7, 5.3 5.5, 7.3 5.5 C9 5.5, 12 7.5, 12 7.5 C12 7.5, 15 5.5, 16.7 5.5 C18.7 5.5, 20.5 7, 20.5 9.5 C20.5 13, 18 16.5, 12 20.5 Z"
        fill={filled ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
    </svg>
  );
}

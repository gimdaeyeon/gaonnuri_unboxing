import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import type { PrayerRequest } from '@/lib/types';
import { getDisplayName } from '@/lib/types';
import { usePrayers } from '@/lib/use-prayers';
import { ShuffleQueue } from '@/lib/shuffle-queue';
import {
  UnboxingBoxBack,
  UnboxingBoxFront,
  type BoxPhase,
} from '@/components/unboxing/UnboxingBox';
import { BurstRays } from '@/components/unboxing/BurstRays';
import { Squiggles } from '@/components/unboxing/Squiggles';
import { PrayerReactionButton } from '@/components/prayer/PrayerReactionButton';

// 카드 우물의 하단(= 카드가 솟아오르는 경계)은 입구의 가장 넓은 선인
// SVG y=116에 맞춘다. 앞쪽 레이어(몸통·앞 플랩·앞쪽 림)가 전부 y≥116이라
// 이 선 위로는 아무것도 그려지지 않아 카드와 겹치지 않는다.
// 바닥(y=250)에서 이 선까지 = 134단위. 퍼센트 패딩은 '너비' 기준이므로
// 아래 비율만큼 패딩을 주면 어떤 화면 폭에서도 정확히 맞는다.
const MOUTH_RATIO = (134 / 320) * 100;

const THEME_COLORS = [
  'var(--color-theme-child)',
  'var(--color-theme-disciple)',
  'var(--color-theme-salt)',
];

function themeColorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return THEME_COLORS[Math.abs(hash) % THEME_COLORS.length];
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const TITLE_LETTERS: { text: string; color: string; rotate: number }[] = [
  { text: 'UN', color: 'var(--color-theme-disciple)', rotate: -4 },
  { text: 'BOX', color: 'var(--color-theme-salt)', rotate: 3 },
  { text: 'ING', color: 'var(--color-theme-child)', rotate: -3 },
  { text: '!', color: 'var(--color-text)', rotate: 6 },
];

const BOX_LAYER_CLASS = 'pointer-events-none absolute inset-x-0 bottom-0 w-full text-text';

export function UnboxingPage() {
  const { prayers, loading, handleReacted } = usePrayers();
  const prefersReducedMotion = useReducedMotion();

  const [phase, setPhase] = useState<BoxPhase>('closed');
  const [current, setCurrent] = useState<PrayerRequest | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasDrawnOnce = phase !== 'closed';

  const queueRef = useRef(new ShuffleQueue<PrayerRequest>([], (p) => p.id));
  const mountedRef = useRef(true);

  useEffect(() => {
    queueRef.current.update(prayers);
  }, [prayers]);

  // setup에서 true로 되돌리는 게 중요하다 — StrictMode는 마운트 직후
  // effect를 한 번 더 실행하므로, 그러지 않으면 영구히 false로 남아
  // draw()가 첫 await 뒤에 조용히 멈춘다.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function draw() {
    if (isAnimating || loading) return;
    setIsAnimating(true);

    if (phase === 'closed') {
      // 첫 추첨 — 닫힌 상자를 흔든 뒤 연다.
      setShaking(true);
      await wait(prefersReducedMotion ? 0 : 420);
      if (!mountedRef.current) return;
      setShaking(false);
    } else {
      // 재추첨 — 카드를 상자 안으로 쏙 내려보내고, 열린 상자를 흔든다.
      // 상자를 다시 닫지 않아 "흔들자 새 카드가 슈욱 솟는" 느낌만 남긴다.
      setCardVisible(false);
      await wait(prefersReducedMotion ? 0 : 220);
      if (!mountedRef.current) return;
      setShaking(true);
      await wait(prefersReducedMotion ? 0 : 360);
      if (!mountedRef.current) return;
      setShaking(false);
    }

    setCurrent(queueRef.current.next() ?? null);
    setPhase('open');
    setRevealKey((k) => k + 1);

    // 상자가 열리고 광선이 터진 직후 카드가 슈욱 솟아오른다.
    await wait(prefersReducedMotion ? 0 : 140);
    if (!mountedRef.current) return;
    setCardVisible(true);
    await wait(prefersReducedMotion ? 0 : 220);
    if (!mountedRef.current) return;
    setIsAnimating(false);
  }

  function handleCurrentReacted(updated: PrayerRequest) {
    handleReacted(updated);
    setCurrent(updated);
  }

  const boxLabel =
    phase === 'closed' ? '박스를 열어 기도제목 보기' : '다음 기도제목 뽑기';

  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg">
      <Squiggles reducedMotion={!!prefersReducedMotion} />

      {/* 하단 탭바(3.5rem+세이프에어리어)만큼 빼서 히어로가 그 위에서 마무리되게 한다 */}
      <div className="relative mx-auto flex min-h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom))] max-w-2xl flex-col items-center gap-8 px-4 py-10 text-center sm:px-6">
        <header className="flex flex-col items-center">
          <p className="font-accent text-xs uppercase tracking-[0.2em] text-text-muted">
            2026 Gaonnuri Summer Retreat
          </p>
          <h1 className="mt-3 flex flex-wrap justify-center font-heading text-5xl font-black tracking-tight sm:text-6xl">
            {TITLE_LETTERS.map((part, i) => (
              <span
                key={i}
                className="inline-block"
                style={{ color: part.color, transform: `rotate(${part.rotate}deg)` }}
              >
                {part.text}
              </span>
            ))}
          </h1>
          <p className="mt-3 font-accent text-xs text-text-muted sm:text-sm">
            <span style={{ color: 'var(--color-theme-child)' }}>Child of God</span>
            {' · '}
            <span style={{ color: 'var(--color-theme-disciple)' }}>Disciple of Christ</span>
            {' · '}
            <span style={{ color: 'var(--color-theme-salt)' }}>Salt &amp; Light</span>
          </p>
        </header>

        <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
          {/* 스테이지 — 박스 뒤/카드/박스 앞을 z축으로 겹쳐 카드가 박스 안에서 나오게 한다 */}
          <div className="relative mx-auto w-full max-w-[380px]">
            <UnboxingBoxBack
              phase={phase}
              shaking={shaking}
              reducedMotion={!!prefersReducedMotion}
              className={`${BOX_LAYER_CLASS} z-0`}
            />

            {/* 카드 우물 — 하단 경계가 곧 박스 입구. 카드는 여기서 솟아오른다.
                카드를 우물 바닥에 붙여야(justify-end) y:110%가 카드를 입구 아래로
                완전히 밀어낸다. 위에 붙이면 우물이 카드보다 클 때 삐져나온다.
                mb-8은 카드와 박스 사이 여백 — 우물 자체(숨김 판정의 기준)는 안 건드리고
                버튼·박스만 그만큼 아래로 밀어내 둘을 시각적으로 떼어놓는다. */}
            <div className="relative z-10 mb-8 flex min-h-32 w-full flex-col justify-end overflow-hidden sm:min-h-36">
              <motion.div
                initial={{ y: '120%', scale: 0.35 }}
                animate={{
                  y: cardVisible ? '0%' : '120%',
                  scale: cardVisible ? 1 : 0.35,
                  opacity: prefersReducedMotion && !cardVisible ? 0 : 1,
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.15 }
                    : cardVisible
                      ? // 나올 때 — 살짝 오버슈트하며 탄력있게 슈욱 솟는다.
                        { type: 'spring', stiffness: 300, damping: 20, mass: 0.7 }
                      : // 들어갈 때 — 빠르게 쏙 내려가 상자 안으로 사라진다.
                        { duration: 0.2, ease: [0.4, 0, 1, 1] }
                }
                // 입구(하단)를 기준으로 커지게 해 상자 안에서 작게 나와
                // 슈욱 솟아오르는 느낌을 만든다.
                style={{ transformOrigin: 'bottom center' }}
                className="flex w-full flex-col items-center gap-3 rounded-theme border border-border bg-surface px-5 py-6 sm:px-7"
              >
                {current ? (
                  <>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        color: themeColorForId(current.id),
                        backgroundColor: `color-mix(in srgb, ${themeColorForId(current.id)} 18%, transparent)`,
                      }}
                    >
                      {current.cohort}또래
                    </span>
                    <p className="whitespace-pre-wrap break-keep font-heading text-lg leading-relaxed">
                      {current.content}
                    </p>
                    <span className="text-sm text-text-muted">{getDisplayName(current)}</span>
                    <PrayerReactionButton
                      key={current.id}
                      prayer={current}
                      onReacted={handleCurrentReacted}
                    />
                  </>
                ) : (
                  hasDrawnOnce &&
                  prayers.length === 0 && (
                    <>
                      <p className="text-text-muted">
                        아직 박스가 비어있어요 — 첫 기도제목을 담아주세요!
                      </p>
                      <Link
                        to="/new"
                        className="rounded-theme bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                      >
                        기도제목 남기기
                      </Link>
                    </>
                  )
                )}
              </motion.div>
            </div>

            {/* 입구 아래 박스 몸통 = 클릭 타깃. 퍼센트 패딩이라 박스 SVG와 자동으로 맞는다. */}
            <button
              type="button"
              onClick={draw}
              disabled={isAnimating || loading}
              aria-label={boxLabel}
              style={{ paddingBottom: `${MOUTH_RATIO}%` }}
              // block이어야 한다 — 버튼은 기본이 inline이라 줄 상자의 leading만큼
              // 위에 빈 공간이 생기고, 그만큼 우물 하단이 입구선에서 떠버린다.
              className="relative z-10 block w-full rounded-theme focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default"
            />

            <UnboxingBoxFront
              phase={phase}
              shaking={shaking}
              reducedMotion={!!prefersReducedMotion}
              className={`${BOX_LAYER_CLASS} z-20`}
            />
            <BurstRays
              key={revealKey}
              active={phase === 'open'}
              reducedMotion={!!prefersReducedMotion}
              className={`${BOX_LAYER_CLASS} z-30`}
            />
          </div>

          {loading ? (
            <p className="text-sm text-text-muted">불러오는 중…</p>
          ) : !hasDrawnOnce ? (
            <p className="text-sm text-text-muted">박스를 눌러보세요</p>
          ) : (
            <button
              type="button"
              onClick={draw}
              disabled={isAnimating}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text disabled:opacity-50"
            >
              다시 뽑기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

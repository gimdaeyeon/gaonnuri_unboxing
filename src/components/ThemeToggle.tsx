import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

// 모든 라우트에서 접근 가능한 고정 위치 토글. 좌하단은 그리드의 우하단 FAB
// (PrayerListLayout)와 릴스의 상단 ViewNav 어느 쪽과도 겹치지 않는 유일한 자리.
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="fixed bottom-4 left-4 z-50 flex size-11 items-center justify-center rounded-full border border-border bg-surface text-text shadow-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="flex items-center justify-center"
          initial={prefersReducedMotion ? undefined : { rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

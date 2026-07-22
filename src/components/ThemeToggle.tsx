import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

// 모든 라우트에서 접근 가능한 고정 위치 토글. 하단은 BottomTabBar가 전 라우트를
// 가로질러 차지하므로, 우상단이 유일하게 항상 비어 있는 자리다(언박싱의 가운데
// 정렬 헤더, 모아보기의 좌측 h1, 폼 3종의 좌측 뒤로가기, 릴스 상단 중앙 ViewNav
// 전부 우상단을 침범하지 않는다).
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="fixed top-4 right-4 z-50 flex size-11 items-center justify-center rounded-full border border-border bg-surface text-text shadow-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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

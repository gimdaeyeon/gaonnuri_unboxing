import type { ComponentType } from 'react';
import { Link, useLocation } from 'react-router';
import { LayoutGrid, PackageOpen, PenLine, Search } from 'lucide-react';

// 페이지 콘텐츠가 탭바 아래에 가리지 않도록 각 페이지 최하단 컨테이너에 붙이는 여백.
// 통짜 리터럴이어야 Tailwind v4의 소스 스캔이 클래스를 인식한다 — 문자열을 조합해서
// 만들면 인식하지 못한다.
export const TAB_BAR_PAD = 'pb-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)]';

// '/new'·'/find' 탭에 실어 보낼 state.from의 후보 — 폼이 아니라 "머무는 화면"일 때만
// 되돌아갈 곳으로 심는다. 폼(/new, /edit/*) 위에서 다른 폼 탭을 누르는 경우는 원래
// 각 폼의 fallback(예: /new → /grid)으로 보내는 편이 자연스럽다.
const STAYING_SCREENS = ['/', '/grid', '/slide', '/reels', '/find'];

interface Tab {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
}

const TABS: Tab[] = [
  { to: '/', label: '언박싱', Icon: PackageOpen, match: (p) => p === '/' },
  {
    to: '/grid',
    label: '모아보기',
    Icon: LayoutGrid,
    match: (p) => p === '/grid' || p === '/slide' || p === '/reels',
  },
  { to: '/new', label: '남기기', Icon: PenLine, match: (p) => p === '/new' },
  {
    to: '/find',
    label: '내 기도제목',
    Icon: Search,
    match: (p) => p === '/find' || p.startsWith('/edit/'),
  },
];

// 전역 고정 하단 탭바 — main.tsx에서 한 번만 마운트되어 모든 라우트에서 유지된다.
// 목적지(어디로 갈지)와 표현 방식(그리드/슬라이드/릴스 — 어떻게 볼지)을 분리해,
// 「모아보기」 하나로 묶고 그 안의 세부 뷰 전환은 ViewNav가 담당한다.
export function BottomTabBar() {
  const { pathname } = useLocation();
  const canReturnHere = STAYING_SCREENS.includes(pathname);

  return (
    <nav
      aria-label="주요 이동"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        // '/new'·'/find' 탭은 지금 있는 화면을 되돌아갈 곳으로 실어 보낸다.
        const state =
          (tab.to === '/new' || tab.to === '/find') && canReturnHere
            ? { from: pathname }
            : undefined;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            state={state}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
              active ? 'text-primary-ink' : 'text-text-muted hover:text-text'
            }`}
          >
            <tab.Icon className="size-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

import { NavLink } from 'react-router';

// 그리드/슬라이드/릴스 — 같은 데이터를 보여주는 방식만 바꾸는 세그먼트.
// 어디로 갈지는 BottomTabBar(「모아보기」)가 담당하고, 여기는 순수하게
// 표현 방식 전환만 다룬다.
const NAV_ITEMS: { to: string; label: string; end: boolean }[] = [
  { to: '/grid', label: '그리드', end: false },
  { to: '/slide', label: '슬라이드', end: false },
  { to: '/reels', label: '릴스', end: false },
];

export function ViewNav() {
  return (
    <nav
      aria-label="보기 방식"
      className="inline-flex rounded-full border border-border bg-surface p-1"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-text-muted hover:text-text'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

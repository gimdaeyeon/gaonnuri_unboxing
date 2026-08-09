import { Link, useLocation } from 'react-router';

// 모아보기의 두 층짜리 내비게이션.
// 위층(범위) — 그리드는 언박싱에서 「내가 뽑은 기도제목」만, 슬라이드·릴스는
//   「전체 기도제목」을 보여준다. 보여주는 대상 자체가 다르므로 표현 방식보다 먼저 가른다.
// 아래층(표현 방식) — 전체 기도제목 안에서만 슬라이드/릴스를 고른다. 그리드는 뽑은
//   기도제목 전용이라 고를 게 없어 아래층이 나오지 않는다.
// 어디로 갈지(모아보기 그 자체)는 BottomTabBar가 담당한다.
const ALL_PATHS = ['/slide', '/reels'];

const SCOPES: { to: string; label: string; matches: (pathname: string) => boolean }[] = [
  { to: '/grid', label: '내가 뽑은 기도제목', matches: (p) => p === '/grid' },
  { to: '/slide', label: '전체 기도제목', matches: (p) => ALL_PATHS.includes(p) },
];

const VIEWS: { to: string; label: string }[] = [
  { to: '/reels', label: '릴스' },
  { to: '/slide', label: '슬라이드' },
];

const BAR = 'flex rounded-full border border-border bg-surface p-1';
const PILL = 'whitespace-nowrap rounded-full font-medium transition-colors';
const ACTIVE = 'bg-primary text-primary-foreground';
const INACTIVE = 'text-text-muted hover:text-text';

interface ViewNavProps {
  // 릴스처럼 화면 위에 떠 있을 땐 가운데로 모은다. 기본은 목록 헤더에 맞춘 왼쪽 정렬.
  centered?: boolean;
}

export function ViewNav({ centered = false }: ViewNavProps) {
  const { pathname } = useLocation();

  return (
    <div
      className={`pointer-events-auto flex flex-col gap-2 ${centered ? 'items-center' : 'items-start'}`}
    >
      <nav aria-label="기도제목 범위" className={BAR}>
        {SCOPES.map((scope) => {
          const active = scope.matches(pathname);
          return (
            <Link
              key={scope.to}
              to={scope.to}
              aria-current={active ? 'page' : undefined}
              className={`${PILL} px-4 py-1.5 text-sm ${active ? ACTIVE : INACTIVE}`}
            >
              {scope.label}
            </Link>
          );
        })}
      </nav>

      {ALL_PATHS.includes(pathname) && (
        <nav aria-label="보기 방식" className={BAR}>
          {VIEWS.map((view) => {
            const active = pathname === view.to;
            return (
              <Link
                key={view.to}
                to={view.to}
                aria-current={active ? 'page' : undefined}
                className={`${PILL} px-3 py-1 text-xs ${active ? ACTIVE : INACTIVE}`}
              >
                {view.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

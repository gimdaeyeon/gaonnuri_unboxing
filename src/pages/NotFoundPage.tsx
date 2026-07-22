import { Link } from 'react-router';

// SPA fallback(public/_redirects) 때문에 존재하지 않는 경로도 index.html을
// 받아 이 앱까지 들어온다. 그중 어떤 <Route>와도 안 맞는 경로가 여기로 온다.
export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="font-accent text-5xl font-bold text-primary-ink">404</p>
      <h1 className="font-heading text-xl font-bold">이 상자는 비어 있어요</h1>
      <p className="text-sm text-text-muted">주소가 잘못되었거나 사라진 페이지예요.</p>
      <div className="mt-1 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-theme bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          언박싱으로 가기
        </Link>
        <Link
          to="/grid"
          className="rounded-theme border border-border px-4 py-2 text-sm font-medium text-text-muted hover:text-text"
        >
          그리드로 보기
        </Link>
      </div>
    </div>
  );
}

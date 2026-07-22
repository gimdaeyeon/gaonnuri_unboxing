import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { ViewNav } from '@/components/prayer/ViewNav';
import { Button } from '@/components/ui/button';

interface PrayerListLayoutProps {
  children: ReactNode;
}

// 그리드/슬라이드 페이지가 공유하는 헤더(제목 + 찾기/추가 버튼 + 뷰 네비) + 모바일 FAB.
export function PrayerListLayout({ children }: PrayerListLayoutProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-heading text-2xl font-bold">수련회 기도제목</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/find">
                <Search /> 내 기도제목 찾기
              </Link>
            </Button>
            <Button asChild>
              <Link to="/new">
                <Plus /> 기도제목 추가
              </Link>
            </Button>
          </div>
        </div>
        <ViewNav />
      </header>

      <main className="flex-1">{children}</main>

      <Button
        asChild
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg sm:hidden"
      >
        <Link to="/new" aria-label="기도제목 추가">
          <Plus /> 추가
        </Link>
      </Button>
    </div>
  );
}

import type { ReactNode } from 'react';
import { ViewNav } from '@/components/prayer/ViewNav';
import { TAB_BAR_PAD } from '@/components/nav/BottomTabBar';

interface PrayerListLayoutProps {
  children: ReactNode;
}

// 그리드/슬라이드 페이지가 공유하는 헤더(제목 + 뷰 네비). 찾기·추가 이동은
// 이제 전역 BottomTabBar가 담당하므로 여기서는 표현 방식 전환만 다룬다.
export function PrayerListLayout({ children }: PrayerListLayoutProps) {
  return (
    <div className={`mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 ${TAB_BAR_PAD}`}>
      <header className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-bold">모아보기</h1>
        <ViewNav />
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}

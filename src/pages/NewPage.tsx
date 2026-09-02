import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { PrayerForm } from '@/components/prayer/PrayerForm';
import { ArchiveNoticeDialog } from '@/components/prayer/ArchiveNoticeDialog';
import { useReturnTo } from '@/lib/use-return-to';
import { TAB_BAR_PAD } from '@/components/nav/BottomTabBar';

export function NewPage() {
  const returnTo = useReturnTo('/grid');
  const [noticeOpen, setNoticeOpen] = useState(false);

  return (
    <div className={`mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-4 py-8 sm:px-6 ${TAB_BAR_PAD}`}>
      <header className="flex flex-col gap-4">
        <Link to={returnTo} className="flex items-center gap-1 text-sm text-text-muted hover:text-text">
          <ArrowLeft className="size-4" /> 뒤로
        </Link>
        <h1 className="font-heading text-2xl font-bold">기도제목 남기기</h1>
      </header>
      {/* 아카이브 전환 — 입력 화면은 수련회 때 그대로 두고, 제출을 캡처 단계에서
          가로채 종료 안내만 띄운다. 검증·중복 확인을 다 통과시킨 끝에 알려주는 건
          기도제목을 다 써 넣은 사람에게만 잔인하다 — 첫 제출 시도에서 바로 안내한다. */}
      <div
        onSubmitCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setNoticeOpen(true);
        }}
      >
        <PrayerForm
          requirePassword
          submitLabel="기도제목 올리기"
          // 제출은 위에서 가로채므로 여기까지 오지 않는다.
          onSubmit={async () => {}}
        />
      </div>
      <ArchiveNoticeDialog
        open={noticeOpen}
        onOpenChange={setNoticeOpen}
        description="2026 여름수련회가 마무리되어 새 기도제목은 올릴 수 없어요. 함께 나눈 기도제목들은 기록으로 계속 볼 수 있어요."
      />
    </div>
  );
}

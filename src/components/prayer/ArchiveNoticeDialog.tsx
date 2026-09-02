// 수련회 종료 안내 — 쓰기(새 글·수정)가 있던 자리에서, 실제로 시도한 순간에만 띄운다.
// 화면과 탭은 수련회 때 모습 그대로 두기로 했다: 배너로 미리 막는 것보다 기록을
// 둘러보는 데 방해가 없고, 시도한 사람에게만 정확한 안내가 닿는다.
import { Archive } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ArchiveNoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // 어떤 시도였는지에 맞춘 본문 — 새 글과 수정이 서로 다른 문장을 쓴다.
  description: string;
}

export function ArchiveNoticeDialog({ open, onOpenChange, description }: ArchiveNoticeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Archive className="text-accent" />
          </AlertDialogMedia>
          <AlertDialogTitle>수련회가 끝났어요</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

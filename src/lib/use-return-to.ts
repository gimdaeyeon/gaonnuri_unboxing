import { useLocation } from 'react-router';

// 탭바·링크가 navigate/Link의 state.from에 출발지를 심어준다. 직접 URL로
// 들어오면 state가 없으므로 fallback을 쓴다. navigate(-1)은 첫 진입일 때
// 히스토리가 없어 사이트 밖으로 나가버릴 수 있어 쓰지 않는다.
export function useReturnTo(fallback: string): string {
  const { state } = useLocation();
  const from = (state as { from?: string } | null)?.from;
  // 내부 경로만 허용 — '//evil.com'은 protocol-relative URL이라 외부로 나간다
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
    ? from
    : fallback;
}

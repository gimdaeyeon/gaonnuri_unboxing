// 앱의 디자인 토큰을 그대로 옮겨온 값 — src/index.css의 :root 블록이 원본이다.
// 영상과 실제 서비스의 색이 어긋나면 포트폴리오에서 "같은 것"으로 안 보이므로
// 하드코딩하지 말고 여기 한 곳에서만 관리한다.
export const C = {
  bg: '#101010',
  surface: '#1a1a1a',
  text: '#fafafa',
  textMuted: '#a3a3a3',
  primary: '#c2d62e',
  accent: '#ef619d',
  border: '#2e2e2e',
  boxInner: 'rgba(0, 0, 0, 0.6)',
  // 시안의 3주제 색 — 또래 배지·광선·스퀴글에 순환 사용
  child: '#ef619d',
  disciple: '#c2d62e',
  salt: '#5aa7db',
} as const;

export const F = {
  // 한글 본문 — 실제 서비스와 동일
  body: "'Pretendard', system-ui, sans-serif",
  // 영문 장식 전용. 한글에는 쓰지 않는다(글리프가 없어 깨진다).
  accent: "'Silkscreen', monospace",
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

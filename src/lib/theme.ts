import { useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'unboxing-theme';
const THEME_COLOR: Record<Theme, string> = {
  dark: '#101010',
  light: '#faf8f3',
};

function readInitialTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  return attr === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // 사파리 프라이빗 모드 등 localStorage 접근 불가 — 무시하고 진행
  }
}

// 인라인 부트스트랩 스크립트(index.html)가 이미 <html data-theme>를 확정해두므로,
// 여기서는 그 값을 그대로 읽어와 상태와 DOM을 동기화한다.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  }

  return { theme, toggle };
}

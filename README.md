# Unboxing — 수련회 기도제목

2026 가온누리 여름수련회 "Unboxing" 기도제목 공유 사이트.
Vite + React (CSR) + TypeScript + Tailwind CSS v4 + shadcn/ui + Framer Motion.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

## 페이지 · 네비게이션

전역 하단 탭바([BottomTabBar.tsx](src/components/nav/BottomTabBar.tsx), `main.tsx`에서 한 번만
마운트)가 4개 목적지를 담당한다. 목적지(어디로 갈지)와 표현 방식(어떻게 볼지)을 분리한 게 핵심 —
그리드·슬라이드·릴스는 전부 「모아보기」 하나로 묶이고, 그 안에서만
[ViewNav](src/components/prayer/ViewNav.tsx)로 세부 뷰를 전환한다.

| 탭 | 경로 | 설명 |
|----|------|------|
| 언박싱 | `/` | 박스를 열면 랜덤 기도제목이 튀어나온다 |
| 모아보기 | `/grid` (활성: `/grid` `/slide` `/reels`) | 그리드·슬라이드·릴스 세그먼트 |
| 남기기 | `/new` | 새 기도제목 입력 |
| 내 기도제목 | `/find` (활성: `/find` `/edit/*`) | 또래 + 이름으로 검색·수정 |

새 목적지를 추가할 땐 `BottomTabBar`의 `TABS` 배열만 고치면 된다.

폼(`/new` `/find` `/edit/:id`)의 "뒤로"는 항상 왔던 곳으로 돌아간다 —
[useReturnTo](src/lib/use-return-to.ts)가 `Link`/`navigate`의 `state.from`을 읽고,
직접 URL로 들어와 state가 없으면 각 폼의 fallback(`/new`→`/grid`, `/find`→`/`,
`/edit/:id`→`/find`)으로 간다. 탭바가 폼 링크에 `state.from`을 자동으로 실어준다.

그리드/슬라이드는 [PrayerListLayout](src/components/prayer/PrayerListLayout.tsx) +
[usePrayers](src/lib/use-prayers.ts)를 공유하고, 언박싱 전용 UI는
[src/components/unboxing/](src/components/unboxing) 아래에 있다.

## 나중에 바꿀 때 알아둘 곳

### 1. 디자인 토큰

디자인 토큰은 시안(검정 배경 + 라임·핑크·블루) 값으로 이미 교체되어 있다.
[src/index.css](src/index.css) 상단의 **★ 디자인 토큰** `:root` 블록 값만 바꾸면
전체 색·폰트·radius가 한 번에 바뀐다. 컴포넌트는 시맨틱 클래스(`bg-surface`,
`text-text-muted`, `bg-primary`, `font-heading`, `rounded-theme` 등)만 사용하므로
JSX 수정이 필요 없다. 구체 색상 클래스(`bg-indigo-500` 등)는 금지.
영문 장식 텍스트(`UNBOXING`, 스탬프 등)는 `font-accent`(Silkscreen, `index.html`에서 로드)를
쓰고 한글에는 적용하지 않는다. 실제 시안 폰트 파일이 생기면 `--font-accent` 값만 교체하면 된다.

**다크/라이트 토글**: 다크가 기본값이고, `:root[data-theme='light']`가 라이트 오버라이드다
([ThemeToggle.tsx](src/components/ThemeToggle.tsx)가 `<html data-theme>`를 토글, `index.html`의
인라인 스크립트가 첫 페인트 전에 OS 설정/localStorage로 초기값을 정해 깜빡임을 막는다).
`--color-primary`는 **채움 전용**(`bg-primary`), `--color-primary-ink`는 **글자 전용**
(`text-primary-ink`)이다 — 라이트 배경 위 라임 글자는 대비가 안 나와 어두운 값으로 분리했다.
새 컴포넌트에서 라임을 글자색으로 쓸 땐 반드시 `text-primary-ink`를 쓸 것.

### 2. mock → Supabase 전환

모든 데이터 접근은 `prayerRepository` 인터페이스를 경유합니다
(컴포넌트에서 mock 직접 import 금지).

1. `npm i @supabase/supabase-js`
2. `.env.local.example` → `.env.local` 복사 후 값 입력
3. [src/lib/supabase/client.ts](src/lib/supabase/client.ts) 주석 해제
4. [src/lib/data/supabase-repository.ts](src/lib/data/supabase-repository.ts)의 메서드 구현 (주석에 쿼리 예시 있음)
5. [src/lib/data/prayer-repository.ts](src/lib/data/prayer-repository.ts)의 **한 줄** 교체:

```ts
export const prayerRepository: PrayerRepository = supabasePrayerRepository;
```

테이블: `prayer_requests` — 컬럼은 snake_case (`author_name`, `cohort`,
`is_anonymous`, `category`, `content`, `created_at`, `updated_at`).
`(cohort, author_name)` 인덱스 권장.

## 설계 메모

- **또래+이름**이 검색·수정의 식별 키 (익명 글도 검색 가능 — 익명은 목록 표시만 가림)
- 인증 없음 — 교회 내부 신뢰 전제 (의도된 설계)
- mock 데이터는 메모리 저장이라 새로고침 시 초기화됨 (mock 단계에선 정상)

# Unboxing — 수련회 기도제목

2026 가온누리 여름수련회 "Unboxing" 기도제목 공유 사이트.
Vite + React (CSR) + TypeScript + Tailwind CSS v4 + shadcn/ui + Framer Motion.

**수련회가 끝나 지금은 읽기 전용 아카이브다.** 마감 시점의 기도제목 스냅샷을
번들에 담아 서비스하고(DB 연결 없음), 쓰기는 전부 닫혔다 — 자세한 건 아래
「2. 데이터」 참고.

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
| 남기기 | `/new` | 수련회 때의 입력 화면 그대로 — 제출하면 종료 안내 |
| 내 기도제목 | `/find` (활성: `/find` `/edit/*`) | 또래 + 이름으로 검색 |

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

### 2. 데이터 (아카이브)

수련회가 끝나면서(2026-08) Supabase를 걷어냈다. 마감 시점의 기도제목 스냅샷이
[src/lib/data/prayers.json](src/lib/data/prayers.json)이다 — 비밀번호와 관리자가
숨긴 글(`is_del`)은 내보내지 않았고, **이름은 성만 남기고 마스킹**했다(예: 김민수 →
김00). 실명은 repo 어디에도 없고, 이름 검색은 입력을 같은 규칙(`maskName`)으로
마스킹한 뒤 비교하므로 사용자는 계속 실명으로 검색하면 된다.
[prayer-repository.ts](src/lib/data/prayer-repository.ts)가 이 파일을 읽는 정적 구현이다. 인터페이스에는 읽기(`getAll`/`getById`/`findByAuthor`)만
남겼다: 쓰기를 타입에서 지운 것이 "읽기 전용"의 보장이라, 화면 코드가 실수로
쓰기를 되살릴 방법이 없다.

화면과 탭은 수련회 때 모습 그대로다. 대신 실제 쓰기가 일어나던 순간에
[ArchiveNoticeDialog](src/components/prayer/ArchiveNoticeDialog.tsx)가 종료를 안내한다 —
새 글은 제출을 캡처 단계에서 가로채고([NewPage](src/pages/NewPage.tsx)), 수정 버튼은
화면 이동 대신 팝업을 띄운다([PrayerFinder](src/components/prayer/PrayerFinder.tsx)).
`/edit/:id`는 딥링크용으로만 남아 카드와 안내문을 보여준다. 관리자 화면(`/admin`)과
언박싱 제목의 숨은 입구는 관리할 DB가 없어져 함께 제거했다.

'함께 기도해요'만 계속 동작한다 — 서버가 없으니 이 기기(localStorage)에만 남는
+1이다. 수련회 기간의 반응(스냅샷 카운트에 이미 반영됨)과 이후의 로컬 반응을
다른 키로 나눠 이중 계산을 막는다: [reacted-storage.ts](src/lib/reacted-storage.ts).

`supabase/migrations/`는 운영 당시 DB 이력 기록으로 남겨 두었다.

## 설계 메모

- **또래+이름**이 검색의 식별 키 (익명 글도 검색 가능 — 익명은 목록 표시만 가림)
- 인증 없음 — 교회 내부 신뢰 전제 (의도된 설계)

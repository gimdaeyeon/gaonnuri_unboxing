# Unboxing — 수련회 기도제목

2026 가온누리 여름수련회 "Unboxing" 기도제목 공유 사이트.
Vite + React 19 (CSR) · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion.

**🔗 [gaonnuri-unboxing.netlify.app](https://gaonnuri-unboxing.netlify.app/)**

[![Unboxing 시연](docs/demo.gif)](https://gaonnuri-unboxing.netlify.app/)

실제 운영은 3박 4일 수련회 기간뿐이었고, **지금은 읽기 전용 아카이브다.**
Supabase를 걷어내고 마감 시점 스냅샷(88건, 이름 마스킹)을 번들에 담아 서비스한다 —
자세한 건 [데이터](#데이터--아카이브-전환) 참고.

위 GIF는 [`video/`](video)의 소개 영상(Remotion으로 실제 컴포넌트를 렌더)에서 잘라낸 것이다.

## 페이지 · 네비게이션

| 탭 | 경로 | 설명 |
|----|------|------|
| 언박싱 | `/` | 박스를 열면 랜덤 기도제목이 튀어나온다 |
| 모아보기 | `/grid` (활성: `/grid` `/slide` `/reels`) | 그리드·슬라이드·릴스 세그먼트 |
| 남기기 | `/new` | 수련회 때의 입력 화면 그대로 — 제출하면 종료 안내 |
| 내 기도제목 | `/find` (활성: `/find` `/edit/*`) | 또래 + 이름으로 검색 |

- **목적지와 표현 방식을 분리했다.** 그리드·슬라이드·릴스는 전부 「모아보기」 하나로 묶이고,
  그 안에서만 [ViewNav](src/components/prayer/ViewNav.tsx)로 세부 뷰를 바꾼다. 탭을 늘릴 땐
  [BottomTabBar](src/components/nav/BottomTabBar.tsx)의 `TABS` 배열만 고치면 된다
  (`main.tsx`에서 한 번만 마운트되는 전역 탭바).
- **폼의 "뒤로"는 항상 왔던 곳으로 간다.** [useReturnTo](src/lib/use-return-to.ts)가 `state.from`을
  읽고, 직접 URL로 들어와 state가 없으면 폼별 fallback(`/new`→`/grid`, `/find`→`/`,
  `/edit/:id`→`/find`)으로 보낸다. 탭바가 폼 링크에 `state.from`을 자동으로 실어준다.
- 그리드/슬라이드는 [PrayerListLayout](src/components/prayer/PrayerListLayout.tsx) +
  [usePrayers](src/lib/use-prayers.ts)를 공유하고, 언박싱 전용 UI는
  [src/components/unboxing/](src/components/unboxing) 아래에 있다.

## 데이터 — 아카이브 전환

수련회가 끝나면서(2026-08) Supabase를 걷어냈다. 마감 시점 스냅샷이
[prayers.json](src/lib/data/prayers.json)이고,
[prayer-repository.ts](src/lib/data/prayer-repository.ts)가 이 파일을 읽는 정적 구현이다.

- **이름은 성만 남기고 마스킹**했다(김민수 → 김00). 실명은 repo·번들 어디에도 없다.
  이름 검색은 입력을 같은 규칙(`maskName`)으로 마스킹한 뒤 비교하므로 사용자는 계속 실명으로
  검색하면 된다. 비밀번호 컬럼과 관리자가 숨긴 글은 내보내지 않았다.
- **쓰기는 타입에서 지웠다.** 인터페이스에 `getAll`/`getById`/`findByAuthor`만 남겨서,
  화면 코드가 실수로 쓰기를 되살릴 방법이 없다 — 런타임 가드가 아니라 컴파일러가 막는다.
- **화면과 탭은 수련회 때 모습 그대로다.** 대신 쓰기가 일어나던 순간에
  [ArchiveNoticeDialog](src/components/prayer/ArchiveNoticeDialog.tsx)가 종료를 안내한다 —
  새 글은 제출을 캡처 단계에서 가로채고([NewPage](src/pages/NewPage.tsx)), 수정 버튼은 화면 이동
  대신 팝업을 띄운다([PrayerFinder](src/components/prayer/PrayerFinder.tsx)).
  `/edit/:id`는 딥링크용으로만 남아 카드와 안내문을 보여준다.
- **'함께 기도해요'만 계속 동작한다.** 서버가 없으니 이 기기(localStorage)에만 남는 +1이다.
  수련회 기간의 반응(스냅샷 카운트에 이미 반영됨)과 이후의 로컬 반응을 다른 키로 나눠 이중
  계산을 막는다: [reacted-storage.ts](src/lib/reacted-storage.ts).

`supabase/migrations/`는 운영 당시 DB 이력 기록으로만 남겨 두었다.

## 관리자 화면 (운영 당시)

지금은 코드에 없다 — 관리할 DB가 사라졌고 스냅샷에도 숨긴 글은 빠져 있어서, 아카이브 전환 때
`/admin`과 숨은 입구를 함께 지웠다. 운영 중에 어떤 화면이었는지만 적어 둔다
(코드: `git show fc22fda:src/pages/AdminPage.tsx`).

- **숨은 경로** — 탭바에 없는 `/admin`. 언박싱 제목을 2초 안에 10번 누르면 들어갔다.
  수련회 현장에서 주소를 입력할 일 없이 내 폰에서 바로 열려고 만든 입구다.
- **입장 게이트** — 빌드 시점 env(`VITE_ADMIN_PASSWORD`)와 비교하고, 통과 여부는
  `sessionStorage`에 탭 세션 동안만 기억했다. 값이 빌드 JS에 그대로 실리므로 개발자 도구로
  찾을 수는 있다 — 애초에 RLS가 "누구나 쓰기"인 구조라 이 게이트는 보안이 아니라 **실수로
  들어오는 걸 막는 수준**이고, 교회 내부 신뢰를 전제로 거기서 멈췄다. env가 비어 있으면 어떤
  비밀번호도 통과시키지 않았다(기본값을 두면 그 기본값이 곧 공개된 비밀번호다).
- **숨기기 / 다시 보이기** — 행을 지우지 않고 `is_del` 플래그만 세웠다
  ([0003_soft_delete.sql](supabase/migrations/0003_soft_delete.sql)). 수련회 중에 올라온 글을
  급히 내려야 할 수 있는데, 되돌릴 수 없는 삭제는 그 상황에서 더 위험하다. 이미 그 상태인 행은
  `.match({ is_del: !next })`에 걸리지 않아 멱등이었다.
- **쓰기를 한곳에 모았다** — 숨기기는 관리자만 하는 일이라 `admin-repository`에만 두고,
  사용자 화면에는 삭제를 아예 만들지 않았다. 공개 리포지토리는 `is_del = false`만 읽고,
  관리자 리포지토리만 숨긴 글까지 읽어 복원을 가능하게 했다.

## 디자인 토큰

[src/index.css](src/index.css) 상단의 **★ 디자인 토큰** `:root` 블록 값만 바꾸면 전체 색·폰트·
radius가 한 번에 바뀐다. 컴포넌트는 시맨틱 클래스(`bg-surface`, `text-text-muted`, `bg-primary`,
`font-heading`, `rounded-theme`)만 쓰므로 JSX 수정이 필요 없다. 구체 색상 클래스(`bg-indigo-500` 등)는 금지.

- **다크/라이트** — 다크가 기본, `:root[data-theme='light']`가 라이트 오버라이드다.
  [ThemeToggle](src/components/ThemeToggle.tsx)이 `<html data-theme>`를 토글하고, `index.html`의
  인라인 스크립트가 첫 페인트 전에 OS 설정/localStorage로 초기값을 정해 깜빡임을 막는다.
- **라임은 채움 전용** — `--color-primary`는 `bg-primary`로만, 글자색은 `--color-primary-ink`
  (`text-primary-ink`)를 쓴다. 라이트 배경 위 라임 글자는 대비가 안 나와 값을 분리했다.
- **영문 장식 텍스트**(`UNBOXING`, 스탬프)는 `font-accent`(Silkscreen, `index.html`에서 로드).
  한글에는 적용하지 않는다.

## 설계 메모

- **또래 + 이름**이 검색의 식별 키 (익명 글도 검색된다 — 익명은 목록 표시만 가린다)
- 인증 없음 — 교회 내부 신뢰 전제 (의도된 설계)

# 수련회 기도제목

교회 수련회용 기도제목 공유 사이트. Vite + React (CSR) + TypeScript + Tailwind CSS v4 + shadcn/ui + Framer Motion.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | 기도제목 목록 — 그리드 / 슬라이드 / 릴스 뷰 전환 |
| `/new` | 새 기도제목 입력 |
| `/find` | 또래 + 이름으로 내 기도제목 검색 |
| `/edit/:id` | 기도제목 수정 |

## 나중에 바꿀 때 딱 두 군데

### 1. 디자인 리스킨 (포스터 시안 나오면)

[src/index.css](src/index.css) 상단의 **★ 디자인 토큰** `:root` 블록 값만 교체하면
전체 색·폰트·radius가 한 번에 바뀝니다. 컴포넌트는 시맨틱 클래스(`bg-surface`,
`text-text-muted`, `bg-primary`, `font-heading`, `rounded-theme` 등)만 사용하므로
JSX 수정이 필요 없습니다. 구체 색상 클래스(`bg-indigo-500` 등)는 금지.

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

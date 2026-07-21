-- 수련회 기도제목 사이트 — 테이블 + 최소 RLS
-- 앱 PrayerRequest 필드를 snake_case로 옮기고 password 한 컬럼만 추가.
-- 보안 수준은 mock과 동일 (비밀번호 평문, 누구나 읽기/쓰기) — 교회 내부용.

create table prayer_requests (
  id            uuid        primary key default gen_random_uuid(),
  author_name   text        not null,                              -- 이름
  cohort        text        not null,                              -- 또래 (출생연도 뒤 2자리)
  is_anonymous  boolean     not null default false,                -- 익명 표시 여부
  content       text        not null,                              -- 기도제목 본문
  pray_count    integer     not null default 0,                    -- '함께 기도해요' 수
  password      text        not null default 0000,                              -- 수정 비밀번호
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- RLS 켜기 + 누구나 읽기/쓰기 허용 (anon 키로 접근 가능하게)
alter table prayer_requests enable row level security;

create policy "anyone can read"   on prayer_requests for select using (true);
create policy "anyone can insert" on prayer_requests for insert with check (true);
create policy "anyone can update" on prayer_requests for update using (true) with check (true);

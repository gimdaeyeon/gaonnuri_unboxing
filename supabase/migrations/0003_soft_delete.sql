-- 소프트 삭제 — 행을 지우지 않고 is_del 플래그만 세운다.
--
-- 실제 delete를 열면 지금의 RLS(누구나 쓰기) 아래에서는 누구든 남의 기도제목을
-- 영구히 지울 수 있다. 플래그만 세우면 잘못 지워도 되돌릴 수 있고, 정책도
-- 이미 열려 있는 update 하나로 끝난다.
--
-- 앱의 모든 조회는 is_del = false인 행만 읽는다(supabase-repository.ts).

alter table prayer_requests
  add column if not exists is_del boolean not null default false;   -- 삭제 여부

-- 삭제된 기도제목에는 반응이 올라가지 않게 한다. 목록에서 사라진 뒤에도 이미
-- 열려 있던 화면에서는 버튼을 누를 수 있으므로 조건을 함수 안에서 막는다.
-- 나머지는 0002와 동일하다(security definer + search_path 고정 이유도 그대로).
create or replace function increment_pray_count(p_id uuid)
returns integer
language sql
volatile
security definer
set search_path = public
as $$
  update prayer_requests
  set pray_count = pray_count + 1
  where id = p_id and not is_del
  returning pray_count;
$$;

-- 없는 id거나 이미 지워진 기도제목이면 갱신된 행이 없어 null이 반환된다.
-- 호출 측에서 오류로 처리한다.

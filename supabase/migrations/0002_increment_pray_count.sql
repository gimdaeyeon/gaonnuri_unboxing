-- '함께 기도해요' 카운트를 원자적으로 1 올린다.
--
-- 기존 구현은 클라이언트에서 select → +1 → update 하는 읽기-후-쓰기였다.
-- 두 사람이 왕복 시간(수십~수백 ms) 안에 같이 누르면 둘 다 같은 값을 읽고
-- 같은 값을 쓰기 때문에, N명이 동시에 눌러도 카운트는 +1만 오른다.
-- 여기서는 update 한 문장 안에서 pray_count + 1을 계산하므로 행 잠금이
-- 동시 요청을 직렬화해 손실이 발생하지 않는다.
--
-- security definer — 지금은 update 정책이 열려 있어 굳이 필요하지 않지만,
-- 나중에 쓰기를 닫아도(수련회 종료 후 '보기 전용' 전환) 이 함수는 계속
-- 동작해야 하므로 소유자 권한으로 실행되게 둔다.
-- search_path 고정은 security definer 함수의 기본 안전장치다.

create or replace function increment_pray_count(p_id uuid)
returns integer
language sql
volatile
security definer
set search_path = public
as $$
  update prayer_requests
  set pray_count = pray_count + 1
  where id = p_id
  returning pray_count;
$$;

-- 없는 id를 넘기면 갱신된 행이 없어 null이 반환된다. 호출 측에서 오류로 처리한다.

grant execute on function increment_pray_count(uuid) to anon, authenticated;

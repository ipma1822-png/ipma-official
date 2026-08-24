-- =========================================================
-- GMS GATEWAY STATS V1 · 대문페이지 전용 실시간 통계 함수
-- IPMA Gateway v1.3.5
--
-- 핵심:
-- 1) 홈페이지가 여러 조직 RPC를 따로 호출하지 않고 이 함수 1개만 읽음
-- 2) 방금 등록한 WTKF 62명 / IDP 62명 즉시 반영
-- 3) 기존 명부 + 현재 GMS 조직회원 + 승인회원 합산
-- 4) 기존 데이터 삭제/수정 없음
-- =========================================================

begin;

create or replace function public.gms_get_gateway_stats_v1()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_legacy_all bigint := 0;
  v_members_all bigint := 0;

  v_wtkf_legacy bigint := 0;
  v_ipma_legacy bigint := 0;
  v_idp_legacy bigint := 0;

  v_wtkf_current bigint := 0;
  v_ipma_current bigint := 0;
  v_idp_current bigint := 0;

  v_wtkf_approved bigint := 0;
  v_ipma_approved bigint := 0;
  v_idp_approved bigint := 0;

  v_global_approved bigint := 0;
  v_global_countries bigint := 0;
  v_new_today bigint := 0;
begin
  -- 전체 현재 GMS 회원
  select count(*)
    into v_members_all
  from public.members
  where coalesce(status::text,'active') <> 'inactive';

  select count(*)
    into v_new_today
  from public.members
  where coalesce(status::text,'active') <> 'inactive'
    and created_at >= date_trunc('day', now());

  -- 기존 명부
  if to_regclass('public.gms_legacy_members') is not null then
    select count(*) into v_legacy_all
    from public.gms_legacy_members
    where coalesce(status::text,'active') <> 'inactive';

    select count(*) into v_wtkf_legacy
    from public.gms_legacy_members
    where upper(coalesce(organization_code,''))='WTKF'
      and coalesce(status::text,'active') <> 'inactive';

    select count(*) into v_ipma_legacy
    from public.gms_legacy_members
    where upper(coalesce(organization_code,''))='IPMA'
      and coalesce(status::text,'active') <> 'inactive';

    select count(*) into v_idp_legacy
    from public.gms_legacy_members
    where upper(coalesce(organization_code,''))='IDP'
      and coalesce(status::text,'active') <> 'inactive';
  end if;

  -- 현재 WTKF 조직회원:
  -- 관리자 직접등록 profile + 조직등급 중 member_id 기준 기술적 중복만 제거
  select count(distinct q.member_id)
    into v_wtkf_current
  from (
    select p.member_id
    from public.gms_admin_member_profiles p
    join public.members m on m.id=p.member_id
    where upper(coalesce(p.organization_code,''))='WTKF'
      and coalesce(m.status::text,'active') <> 'inactive'

    union all

    select l.member_id
    from public.organization_member_levels l
    join public.members m on m.id=l.member_id
    where upper(coalesce(l.organization_code,''))='WTKF'
      and coalesce(l.status::text,'active') <> 'inactive'
      and coalesce(m.status::text,'active') <> 'inactive'
  ) q;

  -- 현재 IPMA 조직회원
  select count(distinct q.member_id)
    into v_ipma_current
  from (
    select p.member_id
    from public.gms_admin_member_profiles p
    join public.members m on m.id=p.member_id
    where upper(coalesce(p.organization_code,''))='IPMA'
      and coalesce(m.status::text,'active') <> 'inactive'

    union all

    select l.member_id
    from public.organization_member_levels l
    join public.members m on m.id=l.member_id
    where upper(coalesce(l.organization_code,''))='IPMA'
      and coalesce(l.status::text,'active') <> 'inactive'
      and coalesce(m.status::text,'active') <> 'inactive'
  ) q;

  -- 현재 IDP 조직회원
  select count(distinct q.member_id)
    into v_idp_current
  from (
    select p.member_id
    from public.gms_admin_member_profiles p
    join public.members m on m.id=p.member_id
    where upper(coalesce(p.organization_code,''))='IDP'
      and coalesce(m.status::text,'active') <> 'inactive'

    union all

    select l.member_id
    from public.organization_member_levels l
    join public.members m on m.id=l.member_id
    where upper(coalesce(l.organization_code,''))='IDP'
      and coalesce(l.status::text,'active') <> 'inactive'
      and coalesce(m.status::text,'active') <> 'inactive'
  ) q;

  -- 승인신청 테이블이 존재하는 경우만 합산
  if to_regclass('public.wtkf_member_applications') is not null then
    execute 'select count(*) from public.wtkf_member_applications where lower(coalesce(status::text,''''))=''approved'''
      into v_wtkf_approved;
  end if;

  if to_regclass('public.ipma_member_applications') is not null then
    execute 'select count(*) from public.ipma_member_applications where lower(coalesce(status::text,''''))=''approved'''
      into v_ipma_approved;
  end if;

  if to_regclass('public.idp_member_applications') is not null then
    execute 'select count(*) from public.idp_member_applications where lower(coalesce(status::text,''''))=''approved'''
      into v_idp_approved;
  end if;

  if to_regclass('public.gms_global_applications') is not null then
    execute 'select count(*) from public.gms_global_applications where lower(coalesce(status::text,''''))=''approved'''
      into v_global_approved;

    execute 'select count(distinct country_code) from public.gms_global_applications where lower(coalesce(status::text,''''))=''approved'' and nullif(trim(country_code),'''') is not null'
      into v_global_countries;
  end if;

  return jsonb_build_object(
    'public_members_total', v_legacy_all + v_members_all,

    'wtkf_members_total', v_wtkf_legacy + v_wtkf_current + v_wtkf_approved,
    'ipma_members_total', v_ipma_legacy + v_ipma_current + v_ipma_approved,
    'idp_members_total', v_idp_legacy + v_idp_current + v_idp_approved,

    'wtkf_legacy', v_wtkf_legacy,
    'wtkf_current', v_wtkf_current,
    'wtkf_approved', v_wtkf_approved,

    'ipma_legacy', v_ipma_legacy,
    'ipma_current', v_ipma_current,
    'ipma_approved', v_ipma_approved,

    'idp_legacy', v_idp_legacy,
    'idp_current', v_idp_current,
    'idp_approved', v_idp_approved,

    'global_approved', v_global_approved,
    'global_countries', v_global_countries,
    'new_members_today', v_new_today,

    'network_countries', 51,
    'network_branches', 150
  );
end;
$$;

revoke all on function public.gms_get_gateway_stats_v1() from public;
grant execute on function public.gms_get_gateway_stats_v1()
to anon, authenticated;

notify pgrst, 'reload schema';

commit;

-- =========================================================
-- 실행 직후 확인
-- 결과 JSON 안에서 최소한
-- "wtkf_current": 62 이상
-- "idp_current": 62 이상
-- 이어야 합니다.
-- =========================================================
select public.gms_get_gateway_stats_v1();

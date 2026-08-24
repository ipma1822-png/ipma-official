-- =========================================================
-- GMS PUBLIC STATS V2.3 · SIMPLE SUM + IDP 62명 반영
-- 목적
-- 1) 대문페이지 상단 3개 + 하단 7개 숫자를 동일한 Supabase 통계로 연결
-- 2) 기존 명부 + 현재 GMS 회원을 단순 합산 (사람 이름 기준 중복검사 안 함)
-- 3) 2026-08-24 WTKF 일괄등록 62명을 IDP 대원(LV.1 WHITE)으로도 지정
-- 기존 데이터 삭제 없음 / 여러 번 실행해도 같은 62명의 IDP 조직등급은 중복 생성되지 않음
-- =========================================================

begin;

-- ---------------------------------------------------------
-- A. 방금 일괄등록한 62명에게 IDP 조직등급 부여
--    이메일 prefix로 해당 배치만 정확히 지정
-- ---------------------------------------------------------
insert into public.organization_member_levels(
  member_id,
  organization_code,
  level_number,
  level_code,
  status,
  changed_reason
)
select
  m.id,
  'IDP',
  1,
  'WHITE',
  'active',
  '2026-08-24 관리자 일괄 국제드론순찰대 대원 임명'
from public.members m
where lower(m.email) like 'wtkf-legacy-20260824-%@member.local'
  and coalesce(m.status,'active') <> 'inactive'
on conflict (member_id, organization_code)
do update set
  status='active',
  changed_reason='2026-08-24 관리자 일괄 국제드론순찰대 대원 임명';

-- ---------------------------------------------------------
-- B. 공개 통계 함수
--    전체회원: 기존명부 행수 + 현재 members 행수 (이름/사람 기준 중복 제거 안 함)
--    조직회원: 기존 조직명부 + 현재 조직회원 + 승인신청
--    단, 동일 member_id가 profile/level 양쪽에 있는 기술적 중복만 1명 처리
-- ---------------------------------------------------------
create or replace function public.gms_get_public_stats(p_organization_code text default null)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_org text := upper(nullif(trim(p_organization_code),''));
  v_legacy_all bigint := 0;
  v_legacy_org bigint := 0;
  v_online bigint := 0;
  v_current_org bigint := 0;
  v_approved bigint := 0;
  v_org_total bigint := 0;
  v_public_total bigint := 0;
  v_global_approved bigint := 0;
  v_global_countries bigint := 0;
  v_new_today bigint := 0;
  v_activity30 bigint := 0;
  v_table text;
  v_network_countries integer := 51;
  v_network_branches integer := 150;
begin
  select count(*)
    into v_legacy_all
  from public.gms_legacy_members
  where status <> 'inactive';

  select count(*)
    into v_online
  from public.members
  where coalesce(status,'active') <> 'inactive';

  -- 사용자가 요청한 단순 합산 방식: 이름/사람 기준 중복검사 없음
  v_public_total := v_legacy_all + v_online;

  select count(*)
    into v_new_today
  from public.members
  where coalesce(status,'active') <> 'inactive'
    and created_at >= date_trunc('day', now());

  if v_org in ('WTKF','IPMA','IDP') then

    select count(*)
      into v_legacy_org
    from public.gms_legacy_members
    where status <> 'inactive'
      and organization_code=v_org;

    select count(distinct x.member_id)
      into v_current_org
    from (
      select p.member_id
      from public.gms_admin_member_profiles p
      join public.members m on m.id=p.member_id
      where p.organization_code=v_org
        and coalesce(m.status,'active') <> 'inactive'

      union

      select l.member_id
      from public.organization_member_levels l
      join public.members m on m.id=l.member_id
      where l.organization_code=v_org
        and coalesce(l.status,'active') <> 'inactive'
        and coalesce(m.status,'active') <> 'inactive'
    ) x;

    if v_org='IPMA' then v_table:='ipma_member_applications';
    elsif v_org='WTKF' then v_table:='wtkf_member_applications';
    elsif v_org='IDP' then v_table:='idp_member_applications';
    end if;

    if v_table is not null and to_regclass('public.'||v_table) is not null then
      execute format(
        'select count(*) from public.%I where lower(coalesce(status::text,''''))=''approved''',
        v_table
      ) into v_approved;
    end if;

    v_org_total := v_legacy_org + v_current_org + v_approved;
  end if;

  if to_regclass('public.gms_global_applications') is not null then
    execute 'select count(*) from public.gms_global_applications where lower(coalesce(status::text,''''))=''approved'''
      into v_global_approved;
    execute 'select count(distinct country_code) from public.gms_global_applications where lower(coalesce(status::text,''''))=''approved'' and nullif(trim(country_code),'''') is not null'
      into v_global_countries;
  end if;

  if to_regclass('public.gms_public_activity') is not null then
    select count(*)
      into v_activity30
    from public.gms_public_activity
    where is_public=true
      and occurred_at >= now()-interval '30 days'
      and (v_org is null or organization_code=v_org);
  end if;

  return jsonb_build_object(
    'organization_code', v_org,
    'public_members_total', v_public_total,
    'organization_members_total', case when v_org is null then null else v_org_total end,
    'legacy_members_total', v_legacy_all,
    'legacy_members', case when v_org is null then v_legacy_all else v_legacy_org end,
    'online_members_total', v_online,
    'current_org_members', v_current_org,
    'approved_applications', v_approved,
    'global_approved', v_global_approved,
    'global_countries', v_global_countries,
    'new_members_today', v_new_today,
    'network_countries', v_network_countries,
    'network_branches', v_network_branches,
    'activity_30d', v_activity30
  );
end $$;

revoke all on function public.gms_get_public_stats(text) from public;
grant execute on function public.gms_get_public_stats(text) to anon, authenticated;

notify pgrst, 'reload schema';

commit;

-- =========================================================
-- C. 실행 직후 확인
-- 아래 결과에서 IDP current_org_members 가 최소 62 이상이면
-- 방금 62명 IDP 임명이 통계에 정상 반영된 것입니다.
-- =========================================================
select public.gms_get_public_stats(null)   as GLOBAL;
select public.gms_get_public_stats('WTKF') as WTKF;
select public.gms_get_public_stats('IPMA') as IPMA;
select public.gms_get_public_stats('IDP')  as IDP;

-- 62명 IDP 지정 자체 확인
select count(*) as idp_batch_members
from public.organization_member_levels l
join public.members m on m.id=l.member_id
where l.organization_code='IDP'
  and coalesce(l.status,'active') <> 'inactive'
  and lower(m.email) like 'wtkf-legacy-20260824-%@member.local';

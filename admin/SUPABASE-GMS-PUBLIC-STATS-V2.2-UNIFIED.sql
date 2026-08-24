-- =========================================================
-- GMS PUBLIC STATS V2.2 · UNIFIED COUNTER
-- 대문페이지: 상단 3개 + 하단 7개 = 총 10개 숫자용
-- 다른 홈페이지: 하단 공통 7개 숫자용
-- 기존 데이터 삭제 없음 / 카운터 함수만 교체
-- =========================================================

create or replace function public.gms_get_public_stats(p_organization_code text default null)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_org text := upper(nullif(trim(p_organization_code),''));
  v_legacy bigint := 0;
  v_legacy_unique bigint := 0;
  v_online bigint := 0;
  v_linked bigint := 0;
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
  -- 기존 단증/과거 명부
  select count(*)
    into v_legacy
  from public.gms_legacy_members
  where status <> 'inactive'
    and (v_org is null or organization_code=v_org);

  select count(distinct person_key)
    into v_legacy_unique
  from public.gms_legacy_members
  where status <> 'inactive';

  -- 현재 GMS 회원 원장
  select count(*)
    into v_online
  from public.members
  where coalesce(status,'active') <> 'inactive';

  -- 과거 명부와 현재 회원이 이미 연결된 경우 전체회원 중복 차감
  select count(distinct linked_member_id)
    into v_linked
  from public.gms_legacy_members
  where status <> 'inactive'
    and linked_member_id is not null;

  v_public_total := greatest(v_legacy_unique + v_online - v_linked, 0);

  -- 오늘 새로 들어온 현재 회원
  select count(*)
    into v_new_today
  from public.members
  where coalesce(status,'active') <> 'inactive'
    and created_at >= date_trunc('day', now());

  -- 조직별 현재 GMS 회원
  if v_org in ('WTKF','IPMA','IDP') then
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

    -- 기존 명부 중 현재 회원과 연결되지 않은 자료만 더함
    select count(*)
      into v_legacy
    from public.gms_legacy_members
    where status <> 'inactive'
      and organization_code=v_org
      and linked_member_id is null;

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

    v_org_total := v_legacy + v_current_org + v_approved;
  end if;

  -- 세계회원 승인/가입국가
  if to_regclass('public.gms_global_applications') is not null then
    execute 'select count(*) from public.gms_global_applications where lower(coalesce(status::text,''''))=''approved'''
      into v_global_approved;
    execute 'select count(distinct country_code) from public.gms_global_applications where lower(coalesce(status::text,''''))=''approved'' and nullif(trim(country_code),'''') is not null'
      into v_global_countries;
  end if;

  select count(*)
    into v_activity30
  from public.gms_public_activity
  where is_public=true
    and occurred_at >= now()-interval '30 days'
    and (v_org is null or organization_code=v_org);

  return jsonb_build_object(
    'organization_code', v_org,
    'public_members_total', v_public_total,
    'organization_members_total', case when v_org is null then null else v_org_total end,
    'legacy_members', v_legacy,
    'legacy_unique_people', v_legacy_unique,
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

-- 확인: 4줄이 모두 숫자로 나오면 정상
select public.gms_get_public_stats(null)   as global_stats;
select public.gms_get_public_stats('WTKF') as wtkf_stats;
select public.gms_get_public_stats('IPMA') as ipma_stats;
select public.gms_get_public_stats('IDP')  as idp_stats;

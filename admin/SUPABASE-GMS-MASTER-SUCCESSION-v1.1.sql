-- IPMA GMS MASTER SUCCESSION SYSTEM v1.1
-- Server-authorized co-admin, UUID binding, organization access, and fail-safe succession.

alter table public.gms_admin_accounts
  add column if not exists auth_user_id uuid references auth.users(id) on delete restrict;

create unique index if not exists gms_admin_accounts_auth_user_id_uq
  on public.gms_admin_accounts(auth_user_id)
  where auth_user_id is not null;

update public.gms_admin_accounts a
set auth_user_id=u.id, updated_at=now()
from auth.users u
where lower(u.email)=lower(a.email)
  and a.auth_user_id is distinct from u.id;

create or replace function public.gms_is_admin()
returns boolean
language sql
stable
security definer
set search_path=public,auth,pg_temp
as $$
  select exists(
    select 1
    from public.gms_admin_accounts a
    join auth.users u on u.id=auth.uid()
    where lower(a.email)=lower(u.email)
      and (a.auth_user_id is null or a.auth_user_id=u.id)
      and a.is_active=true
  );
$$;

create or replace function public.gms_is_master()
returns boolean
language sql
stable
security definer
set search_path=public,auth,pg_temp
as $$
  select exists(
    select 1
    from public.gms_admin_accounts a
    join auth.users u on u.id=auth.uid()
    join public.gms_master_succession s on s.singleton_id=1
    where lower(a.email)=lower(u.email)
      and (a.auth_user_id is null or a.auth_user_id=u.id)
      and lower(a.email)=lower(s.current_master_email)
      and a.role='master' and a.is_active=true
  );
$$;

create or replace function public.gms_is_coadmin()
returns boolean
language sql
stable
security definer
set search_path=public,auth,pg_temp
as $$
  select exists(
    select 1
    from public.gms_admin_accounts a
    join auth.users u on u.id=auth.uid()
    where lower(a.email)=lower(u.email)
      and (a.auth_user_id is null or a.auth_user_id=u.id)
      and a.role='coadmin' and a.is_active=true
  );
$$;

create or replace function public.gms_get_my_admin_context()
returns jsonb
language plpgsql
stable
security definer
set search_path=public,auth,pg_temp
as $$
declare v jsonb;
begin
  select jsonb_build_object(
    'is_admin',true,
    'email',lower(a.email),
    'display_name',a.display_name,
    'role',a.role,
    'is_founder',a.is_founder,
    'is_designated_successor',a.is_designated_successor
  ) into v
  from public.gms_admin_accounts a
  join auth.users u on u.id=auth.uid()
  where lower(a.email)=lower(u.email)
    and (a.auth_user_id is null or a.auth_user_id=u.id)
    and a.is_active=true;

  return coalesce(v,jsonb_build_object('is_admin',false));
end;
$$;

revoke all on function public.gms_is_admin() from public,anon;
revoke all on function public.gms_is_master() from public,anon;
revoke all on function public.gms_is_coadmin() from public,anon;
revoke all on function public.gms_get_my_admin_context() from public,anon;
grant execute on function public.gms_is_admin() to authenticated;
grant execute on function public.gms_is_master() to authenticated;
grant execute on function public.gms_is_coadmin() to authenticated;
grant execute on function public.gms_get_my_admin_context() to authenticated;

-- Central GMS administrator access for operational organization tables.
do $$
declare t text;
begin
  foreach t in array array[
    'activity_events','acts_member_applications','gms_legacy_members',
    'gms_overseas_branches','gms_taekwonkumdo_dojangs',
    'idp_member_applications','idp_branch_applications','idp_branch_profiles',
    'idp_branch_officers','idp_center_applications','idp_official_centers',
    'idp_specialist_applications','idp_volunteer_applications',
    'idp_volunteer_evidence','idp_volunteer_programs','idp_youth_badges',
    'idp_youth_profiles','ipma_member_applications','ipma_service_applications',
    'ipma_products','ipma_payment_settings','ipma_paid_contents',
    'ipma_content_purchases','ipma_resources','ipma_resource_downloads',
    'learning_progress','membership_details','organization_memberships',
    'point_ledger','network_notices','wtkf_member_applications'
  ] loop
    if to_regclass('public.'||t) is not null then
      execute format('drop policy if exists %I on public.%I','gms central admins full access',t);
      execute format('create policy %I on public.%I for all to authenticated using ((select public.gms_is_admin())) with check ((select public.gms_is_admin()))','gms central admins full access',t);
    end if;
  end loop;
end $$;

-- Storage remains bucket-scoped; this does not open unrelated files.
drop policy if exists "gms central admin storage read" on storage.objects;
create policy "gms central admin storage read" on storage.objects for select to authenticated
using (
  bucket_id in ('member-photos','acts-member-photos','idp-member-photos','ipma-member-photos','idp-volunteer-evidence','ipma-private-resources')
  and (select public.gms_is_admin())
);

drop policy if exists "gms central admin storage insert" on storage.objects;
create policy "gms central admin storage insert" on storage.objects for insert to authenticated
with check (
  bucket_id in ('idp-volunteer-evidence','ipma-private-resources')
  and (select public.gms_is_admin())
);

drop policy if exists "gms central admin storage update" on storage.objects;
create policy "gms central admin storage update" on storage.objects for update to authenticated
using (
  bucket_id in ('idp-volunteer-evidence','ipma-private-resources')
  and (select public.gms_is_admin())
)
with check (
  bucket_id in ('idp-volunteer-evidence','ipma-private-resources')
  and (select public.gms_is_admin())
);

drop policy if exists "gms central admin storage delete" on storage.objects;
create policy "gms central admin storage delete" on storage.objects for delete to authenticated
using (
  bucket_id in ('idp-volunteer-evidence','ipma-private-resources')
  and (select public.gms_is_admin())
);

-- Link the authenticated successor to the established ACTS and SPARK role stores.
insert into public.acts_admins(auth_user_id,display_name,is_active)
select id,'공동 관리자',true from auth.users where lower(email)='jhb040715@naver.com'
on conflict (auth_user_id) do update set display_name=excluded.display_name,is_active=true;

insert into public.spark_admin_roles(user_id,role,is_active,note)
select id,'superadmin',true,'GMS 지정 공동관리자' from auth.users where lower(email)='jhb040715@naver.com'
on conflict (user_id) do update set role='superadmin',is_active=true,note=excluded.note;

create or replace function public.gms_run_master_succession()
returns jsonb
language plpgsql
security definer
set search_path=public,auth,pg_temp
as $$
declare
  s public.gms_master_succession%rowtype;
  v_founder_last timestamptz;
  v_successor_id uuid;
  v_reason text;
begin
  select * into s from public.gms_master_succession where singleton_id=1 for update;
  if not found then raise exception 'GMS succession configuration missing'; end if;

  select u.last_sign_in_at into v_founder_last
  from auth.users u where lower(u.email)=lower(s.founder_email)
  order by u.created_at asc limit 1;

  update public.gms_master_succession
  set last_checked_at=now(),updated_at=now() where singleton_id=1;

  insert into public.gms_admin_succession_log(event_type,from_email,to_email,reason,founder_last_sign_in_at)
  values('SUCCESSION_CHECK',s.current_master_email,s.successor_email,'scheduled safety check',v_founder_last);

  if lower(s.current_master_email)<>lower(s.founder_email) or s.succeeded_at is not null then
    return jsonb_build_object('status','ALREADY_SUCCEEDED','succeeded',false,'master',s.current_master_email);
  end if;

  select u.id into v_successor_id
  from auth.users u where lower(u.email)=lower(s.successor_email)
    and u.email_confirmed_at is not null order by u.created_at asc limit 1;

  if v_successor_id is null or not exists(
    select 1 from public.gms_admin_accounts a
    where lower(a.email)=lower(s.successor_email)
      and a.auth_user_id=v_successor_id and a.is_active=true
      and a.is_designated_successor=true and a.role='coadmin'
  ) then
    v_reason:='SUCCESSOR_AUTH_NOT_READY';
  elsif v_founder_last is null then
    v_reason:='FOUNDER_LOGIN_NOT_FOUND';
  elsif v_founder_last > now()-make_interval(days=>s.inactivity_days) then
    return jsonb_build_object(
      'status','NOT_ELIGIBLE','succeeded',false,'master',s.current_master_email,
      'founder_last_sign_in_at',v_founder_last,
      'days_remaining',greatest(0,s.inactivity_days-floor(extract(epoch from (now()-v_founder_last))/86400)::int)
    );
  end if;

  if v_reason is not null then
    insert into public.gms_admin_succession_log(event_type,from_email,to_email,reason,founder_last_sign_in_at)
    values('SUCCESSION_BLOCKED',s.current_master_email,s.successor_email,v_reason,v_founder_last);
    return jsonb_build_object('status','SUCCESSION_BLOCKED','reason',v_reason,'succeeded',false,'master',s.current_master_email);
  end if;

  insert into public.gms_admin_succession_log(event_type,from_email,to_email,reason,founder_last_sign_in_at)
  values('SUCCESSION_ELIGIBLE',s.current_master_email,s.successor_email,s.inactivity_days||' days without master login',v_founder_last);

  update public.gms_admin_accounts set role='master',updated_at=now()
  where lower(email)=lower(s.successor_email) and auth_user_id=v_successor_id and is_active=true;
  if not found then raise exception 'SUCCESSOR_MASTER_ACTIVATION_FAILED'; end if;

  update public.gms_admin_accounts set role='founder',is_founder=true,updated_at=now()
  where lower(email)=lower(s.founder_email) and role='master';
  if not found then raise exception 'PREVIOUS_MASTER_UPDATE_FAILED'; end if;

  update public.gms_master_succession
  set current_master_email=s.successor_email,succeeded_at=now(),last_checked_at=now(),updated_at=now()
  where singleton_id=1 and lower(current_master_email)=lower(s.founder_email) and succeeded_at is null;
  if not found then raise exception 'SUCCESSION_STATE_UPDATE_FAILED'; end if;

  insert into public.gms_admin_succession_log(event_type,from_email,to_email,reason,founder_last_sign_in_at)
  values
    ('SUCCESSION_EXECUTED',s.founder_email,s.successor_email,'automatic 30-day succession',v_founder_last),
    ('MASTER_CHANGED',s.founder_email,s.successor_email,'one-way automatic event; founder preserved',v_founder_last);

  return jsonb_build_object('status','SUCCESSION_EXECUTED','succeeded',true,'master',s.successor_email,'founder',s.founder_email);
end;
$$;

revoke all on function public.gms_run_master_succession() from public,anon,authenticated;
grant execute on function public.gms_run_master_succession() to postgres,service_role;

-- Keep the existing hourly job name/schedule; it calls the replaced safe function.

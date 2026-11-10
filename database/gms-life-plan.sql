-- New isolated storage; no existing GMS or ICA records are changed.
create table public.gms_life_plans (
 user_id uuid primary key references auth.users(id),
 settings jsonb not null default '{}'::jsonb,
 tasks jsonb not null default '[]'::jsonb check (jsonb_typeof(tasks)='array'),
 revision bigint not null default 0,
 updated_at timestamptz not null default now()
);
alter table public.gms_life_plans enable row level security;
revoke all on public.gms_life_plans from anon, authenticated;
grant select,insert,update on public.gms_life_plans to authenticated;
create policy life_plan_master on public.gms_life_plans for all to authenticated
 using (user_id=(select auth.uid()) and (select public.gms_get_my_admin_context()->>'role')='master' and (select public.gms_get_my_admin_context()->>'is_admin')='true')
 with check (user_id=(select auth.uid()) and (select public.gms_get_my_admin_context()->>'role')='master' and (select public.gms_get_my_admin_context()->>'is_admin')='true');
create function public.gms_life_plan_revision() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.revision:=old.revision+1; new.updated_at:=now(); return new; end $$;
revoke all on function public.gms_life_plan_revision() from public,anon,authenticated;
create trigger life_plan_revision before update on public.gms_life_plans for each row execute function public.gms_life_plan_revision();

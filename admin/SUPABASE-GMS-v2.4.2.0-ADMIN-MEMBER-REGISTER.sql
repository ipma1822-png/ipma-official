-- GMS v2.4.2.0 · 관리자 직접 회원등록
-- Supabase > SQL Editor > New query 에서 전체 실행

create table if not exists public.gms_admin_member_profiles (
  member_id uuid primary key references public.members(id) on delete cascade,
  phone text,
  organization_code text not null default 'GENERAL' check (organization_code in ('GENERAL','WTKF','IPMA','IDP')),
  registration_source text not null default 'admin_legacy',
  note text,
  registered_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gms_admin_member_profiles enable row level security;
drop policy if exists "gms admin profiles read" on public.gms_admin_member_profiles;
create policy "gms admin profiles read" on public.gms_admin_member_profiles for select to authenticated
using (lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com'));

create or replace function public.gms_admin_register_member(
 p_name text, p_email text, p_phone text default null, p_organization_code text default 'GENERAL', p_note text default null
) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_admin text:=lower(coalesce(auth.jwt()->>'email','')); v_id uuid; v_org text:=upper(coalesce(nullif(trim(p_organization_code),''),'GENERAL'));
begin
 if v_admin not in ('jeonseongkweon@gmail.com','ipma1822@gmail.com') then raise exception 'GMS 관리자만 등록할 수 있습니다.'; end if;
 if nullif(trim(p_name),'') is null then raise exception '이름은 필수입니다.'; end if;
 if nullif(trim(p_email),'') is null then raise exception '이메일은 필수입니다.'; end if;
 if v_org not in ('GENERAL','WTKF','IPMA','IDP') then raise exception '조직 코드가 올바르지 않습니다.'; end if;
 select id into v_id from public.members where lower(email)=lower(trim(p_email)) limit 1;
 if v_id is not null then raise exception '이미 등록된 이메일입니다: %',trim(p_email); end if;
 insert into public.members(name,email,status) values(trim(p_name),lower(trim(p_email)),'active') returning id into v_id;
 insert into public.gms_admin_member_profiles(member_id,phone,organization_code,note,registered_by) values(v_id,nullif(trim(p_phone),''),v_org,nullif(trim(p_note),''),v_admin);
 return v_id;
end $$;
revoke all on function public.gms_admin_register_member(text,text,text,text,text) from public;
grant execute on function public.gms_admin_register_member(text,text,text,text,text) to authenticated;

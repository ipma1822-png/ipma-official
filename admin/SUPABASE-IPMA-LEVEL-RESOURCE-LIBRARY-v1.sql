-- IPMA LEVEL RESOURCE LIBRARY v1.0
-- Supabase SQL Editor에서 1회 실행
-- 목적: GMS 회원 9단계 + IPMA 조직별 LEVEL을 이용한 비공개 자료 다운로드

create extension if not exists pgcrypto;

create table if not exists public.ipma_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default '기타',
  organization_code text not null default 'IPMA',
  min_level integer not null default 1 check (min_level between 1 and 9),
  storage_path text not null unique,
  file_name text,
  file_type text,
  mime_type text,
  file_size bigint,
  version text,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  download_count bigint not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ipma_resources enable row level security;

drop policy if exists "ipma_resources_catalog_read" on public.ipma_resources;
create policy "ipma_resources_catalog_read"
on public.ipma_resources for select
using (is_active = true or lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com'));

drop policy if exists "ipma_resources_admin_insert" on public.ipma_resources;
create policy "ipma_resources_admin_insert"
on public.ipma_resources for insert to authenticated
with check (lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com'));

drop policy if exists "ipma_resources_admin_update" on public.ipma_resources;
create policy "ipma_resources_admin_update"
on public.ipma_resources for update to authenticated
using (lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com'))
with check (lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com'));

drop policy if exists "ipma_resources_admin_delete" on public.ipma_resources;
create policy "ipma_resources_admin_delete"
on public.ipma_resources for delete to authenticated
using (lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com'));

insert into storage.buckets (id,name,public,file_size_limit)
values ('ipma-private-resources','ipma-private-resources',false,104857600)
on conflict (id) do update set public=false;

-- 관리자: 파일 업로드/수정/삭제
DROP POLICY IF EXISTS "ipma_resource_admin_insert" ON storage.objects;
CREATE POLICY "ipma_resource_admin_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id='ipma-private-resources'
  AND lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com')
);

DROP POLICY IF EXISTS "ipma_resource_admin_update" ON storage.objects;
CREATE POLICY "ipma_resource_admin_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id='ipma-private-resources'
  AND lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com')
)
WITH CHECK (
  bucket_id='ipma-private-resources'
  AND lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com')
);

DROP POLICY IF EXISTS "ipma_resource_admin_delete" ON storage.objects;
CREATE POLICY "ipma_resource_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id='ipma-private-resources'
  AND lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com')
);

-- 회원: 본인 IPMA 조직 LEVEL을 우선, 없으면 GLOBAL LEVEL을 사용.
-- 상태 active인 회원만, 자료의 min_level 이상일 때만 원본 다운로드 가능.
DROP POLICY IF EXISTS "ipma_resource_member_download" ON storage.objects;
CREATE POLICY "ipma_resource_member_download"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id='ipma-private-resources'
  AND (
    lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com')
    OR EXISTS (
      SELECT 1
      FROM public.ipma_resources r
      JOIN public.members m ON m.auth_user_id = auth.uid()
      LEFT JOIN public.organization_member_levels ol
        ON ol.member_id=m.id AND ol.organization_code='IPMA' AND coalesce(ol.status,'active')='active'
      LEFT JOIN public.member_levels gl
        ON gl.member_id=m.id AND coalesce(gl.status,'active')='active'
      WHERE r.storage_path = storage.objects.name
        AND r.is_active=true
        AND coalesce(m.status,'active')='active'
        AND coalesce(ol.level_number, gl.level_number, 0) >= r.min_level
    )
  )
);

-- 다운로드 기록(선택 기능)
create table if not exists public.ipma_resource_downloads (
  id bigint generated always as identity primary key,
  resource_id uuid not null references public.ipma_resources(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  auth_user_id uuid,
  downloaded_at timestamptz not null default now()
);
alter table public.ipma_resource_downloads enable row level security;

drop policy if exists "ipma_download_log_member_insert" on public.ipma_resource_downloads;
create policy "ipma_download_log_member_insert"
on public.ipma_resource_downloads for insert to authenticated
with check (auth_user_id=auth.uid());

drop policy if exists "ipma_download_log_admin_read" on public.ipma_resource_downloads;
create policy "ipma_download_log_admin_read"
on public.ipma_resource_downloads for select to authenticated
using (lower(coalesce(auth.jwt()->>'email','')) in ('jeonseongkweon@gmail.com','ipma1822@gmail.com'));

-- 기존 데모 3건은 넣지 않습니다. 실제 파일 업로드 시 관리자 화면에서 메타데이터가 등록됩니다.

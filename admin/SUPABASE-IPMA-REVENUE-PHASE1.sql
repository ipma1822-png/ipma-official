-- IPMA 수익사업 1단계 통합 신청·심사·발급 장부
-- Supabase SQL Editor에서 전체를 한 번만 실행합니다.

create extension if not exists pgcrypto;

-- IPMA 공식 입금계좌 및 결제 안내 설정
create table if not exists public.ipma_payment_settings (
  setting_key text primary key,
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  payment_notice text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.ipma_payment_settings
  (setting_key, bank_name, account_number, account_holder, payment_notice, is_active)
values
  ('ipma_main', '농협', '301-0141-2075-31', '국제경찰무도연합회',
   '신청자 이름과 입금자 이름을 동일하게 입력해 주세요. 본부 확인 후 결제완료로 변경됩니다.', true)
on conflict (setting_key) do update set
  bank_name = excluded.bank_name,
  account_number = excluded.account_number,
  account_holder = excluded.account_holder,
  payment_notice = excluded.payment_notice,
  is_active = excluded.is_active,
  updated_at = now();

alter table public.ipma_payment_settings enable row level security;

drop policy if exists "ipma public read payment settings" on public.ipma_payment_settings;
create policy "ipma public read payment settings"
on public.ipma_payment_settings for select to anon, authenticated
using (is_active = true);

drop policy if exists "ipma admin update payment settings" on public.ipma_payment_settings;
create policy "ipma admin update payment settings"
on public.ipma_payment_settings for update to authenticated
using ((auth.jwt() ->> 'email') = 'jeonseongkweon@gmail.com')
with check ((auth.jwt() ->> 'email') = 'jeonseongkweon@gmail.com');

create table if not exists public.ipma_service_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  application_type text not null check (application_type in (
    'instructor_course','instructor_exam','certified_dojang','student_exam'
  )),
  applicant_name text not null,
  phone text not null,
  email text not null,
  organization text,
  program_name text,
  student_name text,
  student_birth_date date,
  current_rank text,
  requested_rank text,
  instructor_name text,
  depositor_name text,
  certificate_number text,
  shipping_address text,
  notes text,
  fee_amount integer not null default 0 check (fee_amount >= 0),
  payment_status text not null default 'waiting' check (payment_status in ('waiting','confirmed','refunded','waived')),
  review_status text not null default 'received' check (review_status in ('received','reviewing','approved','rejected','hold')),
  exam_status text not null default 'not_required' check (exam_status in ('not_required','waiting','scheduled','passed','failed')),
  issuance_status text not null default 'not_ready' check (issuance_status in ('not_ready','ready','issued','shipped','completed')),
  admin_memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ipma_service_applications_user_idx
  on public.ipma_service_applications(applicant_user_id, created_at desc);
create index if not exists ipma_service_applications_work_idx
  on public.ipma_service_applications(application_type, review_status, payment_status, created_at desc);

alter table public.ipma_service_applications enable row level security;

drop policy if exists "ipma applicant insert own" on public.ipma_service_applications;
create policy "ipma applicant insert own"
on public.ipma_service_applications for insert to authenticated
with check (applicant_user_id = auth.uid());

drop policy if exists "ipma applicant read own" on public.ipma_service_applications;
create policy "ipma applicant read own"
on public.ipma_service_applications for select to authenticated
using (
  applicant_user_id = auth.uid()
  or (auth.jwt() ->> 'email') = 'jeonseongkweon@gmail.com'
);

drop policy if exists "ipma admin update applications" on public.ipma_service_applications;
create policy "ipma admin update applications"
on public.ipma_service_applications for update to authenticated
using ((auth.jwt() ->> 'email') = 'jeonseongkweon@gmail.com')
with check ((auth.jwt() ->> 'email') = 'jeonseongkweon@gmail.com');

create or replace function public.ipma_set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ipma_service_applications_updated on public.ipma_service_applications;
create trigger ipma_service_applications_updated
before update on public.ipma_service_applications
for each row execute function public.ipma_set_updated_at();

-- 공개 조회용 안전 뷰: 개인정보·연락처·주소는 노출하지 않습니다.
create or replace view public.ipma_public_issuances as
select certificate_number, application_type, applicant_name, organization,
       program_name, requested_rank, issuance_status, updated_at
from public.ipma_service_applications
where certificate_number is not null
  and issuance_status in ('issued','shipped','completed');

-- API 사용 권한. 실제 행 접근은 위 RLS 정책이 다시 제한합니다.
grant select on public.ipma_payment_settings to anon, authenticated;
grant select, insert, update on public.ipma_service_applications to authenticated;
revoke delete on public.ipma_service_applications from anon, authenticated;
grant select on public.ipma_public_issuances to anon, authenticated;

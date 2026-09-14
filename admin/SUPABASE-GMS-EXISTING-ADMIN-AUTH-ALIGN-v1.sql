-- Align the legacy administrator label with the email returned by Google/Supabase Auth.
-- Gmail routes both spellings to the same mailbox, but Supabase authorization compares
-- the canonical authenticated address exactly.
update public.gms_admin_accounts a
set email='ipma.1822@gmail.com',
    auth_user_id=u.id,
    updated_at=now()
from auth.users u
where a.email='ipma1822@gmail.com'
  and lower(u.email)='ipma.1822@gmail.com'
  and not exists (
    select 1 from public.gms_admin_accounts x
    where lower(x.email)='ipma.1822@gmail.com'
  );

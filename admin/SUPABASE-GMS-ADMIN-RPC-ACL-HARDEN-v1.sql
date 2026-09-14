-- Prevent public execution of internal GMS authorization/succession helpers.
revoke all on function public.gms_is_admin_email(text) from public,anon,authenticated;
grant execute on function public.gms_is_admin_email(text) to postgres,service_role;

revoke all on function public.gms_get_admin_succession_status() from public,anon;
grant execute on function public.gms_get_admin_succession_status() to authenticated;

revoke all on function public.gms_sync_admin_auth_role() from public,anon,authenticated;
grant execute on function public.gms_sync_admin_auth_role() to postgres,service_role;

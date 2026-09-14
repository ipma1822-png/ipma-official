-- Replace legacy single-email checks inside established operational RPCs.
-- Function signatures and business logic are preserved; only the authorization
-- predicate is changed to the UUID-backed central GMS administrator function.
do $$
declare
  r record;
  old_ddl text;
  new_ddl text;
begin
  for r in
    select p.oid
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.prokind='f'
      and p.proname like 'idp_admin_%'
      and p.prosrc ilike '%jeonseongkweon@gmail.com%'
  loop
    old_ddl:=pg_get_functiondef(r.oid);
    new_ddl:=regexp_replace(
      old_ddl,
      'if\s+(v_email|lower\(\s*coalesce\(\s*auth\.jwt\(\)->>''email''\s*,\s*''''\s*\)\s*\))\s*<>\s*''jeonseongkweon@gmail\.com''\s*then',
      'if not public.gms_is_admin() then',
      'gin'
    );
    if new_ddl=old_ddl then
      raise exception 'IDP_ADMIN_AUTH_PATTERN_NOT_FOUND: %',r.oid::regprocedure;
    end if;
    execute new_ddl;
  end loop;
end $$;

do $$
declare
  r record;
  old_ddl text;
  new_ddl text;
begin
  for r in
    select p.oid
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname in (
        'gms_record_learning_activity',
        'gms_record_seminar_activity',
        'gms_record_simulator_activity'
      )
  loop
    old_ddl:=pg_get_functiondef(r.oid);
    new_ddl:=regexp_replace(
      old_ddl,
      'v_is_admin\s*:=\s*lower\(coalesce\(auth\.jwt\(\)->>''email'',''''\)\)\s*in\s*\(\s*''jeonseongkweon@gmail\.com''\s*,\s*''ipma1822@gmail\.com''\s*\)\s*;',
      'v_is_admin := public.gms_is_admin();',
      'gin'
    );
    if new_ddl=old_ddl then
      raise exception 'GMS_RECORD_AUTH_PATTERN_NOT_FOUND: %',r.oid::regprocedure;
    end if;
    execute new_ddl;
  end loop;
end $$;

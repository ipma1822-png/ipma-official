-- Extend the existing revision trigger. RLS and all existing records remain in place.
-- Full pre-change snapshots are retained in the same protected owner's settings.
create or replace function public.gms_life_plan_revision()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 new.settings := jsonb_set(new.settings, '{changeHistory}',
  coalesce(old.settings->'changeHistory','[]'::jsonb) || jsonb_build_array(
   jsonb_build_object('at',now(),'revision',old.revision,'tasks',old.tasks,
    'settings',old.settings-'changeHistory')));
 new.revision := old.revision+1;
 new.updated_at := now();
 return new;
end $$;
revoke all on function public.gms_life_plan_revision() from public,anon,authenticated;

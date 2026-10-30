
create table public.ica_number_history (
 id uuid primary key default gen_random_uuid(),
 credential_id uuid not null references public.ica_credentials(id),
 old_no text not null, new_no text not null,
 changed_by uuid not null references auth.users(id),
 changed_at timestamptz not null default now()
);
alter table public.ica_number_history enable row level security;
grant select on public.ica_number_history to authenticated;
revoke insert,update,delete on public.ica_number_history from anon,authenticated;
create policy ica_number_history_admin_read on public.ica_number_history for select to authenticated using ((select private.ica_is_admin()));

create function private.ica_guard_number() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if TG_OP='UPDATE' and new.credential_no is not distinct from old.credential_no then return new; end if;
 perform pg_advisory_xact_lock(820906);
 if new.credential_no is null or btrim(new.credential_no)='' or length(new.credential_no)>200 or new.credential_no<>btrim(new.credential_no) or new.credential_no ~ '[[:cntrl:]]' then raise exception 'INVALID_CREDENTIAL_NUMBER'; end if;
 if TG_OP='UPDATE' then
  if not exists(select 1 from public.gms_admin_accounts where auth_user_id=auth.uid() and is_active and role in ('founder','master')) then raise exception 'ICA_MASTER_REQUIRED'; end if;
  if exists(select 1 from public.ica_status_history where credential_id=old.id and reason like '[ICA_LOGICAL_DELETE]%') then raise exception 'CREDENTIAL_DELETED'; end if;
 end if;
 if exists(select 1 from public.ica_credentials where upper(btrim(credential_no))=upper(btrim(new.credential_no)) and id<>new.id)
 or exists(select 1 from public.gms_legacy_members where upper(btrim(certificate_no))=upper(btrim(new.credential_no)))
 or exists(select 1 from public.ica_number_history where upper(btrim(old_no))=upper(btrim(new.credential_no)) or upper(btrim(new_no))=upper(btrim(new.credential_no))) then
  raise exception 'DUPLICATE_CREDENTIAL_NUMBER' using errcode='23505';
 end if;
 if TG_OP='UPDATE' then
  insert into public.ica_number_history(credential_id,old_no,new_no,changed_by) values(old.id,old.credential_no,new.credential_no,auth.uid());
  new.updated_at:=clock_timestamp();
 end if;
 return new;
end $$;
revoke all on function private.ica_guard_number() from public,anon,authenticated;
create trigger ica_guard_number before insert or update of credential_no on public.ica_credentials for each row execute function private.ica_guard_number();

create function public.ica_change_credential_number(p_id uuid,p_old_no text,p_new_no text,p_updated_at timestamptz) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.ica_credentials%rowtype;
begin
 if not exists(select 1 from public.gms_admin_accounts where auth_user_id=auth.uid() and is_active and role in ('founder','master')) then raise exception 'ICA_MASTER_REQUIRED'; end if;
 update public.ica_credentials set credential_no=btrim(p_new_no) where id=p_id and credential_no=p_old_no and updated_at=p_updated_at returning * into r;
 if not found then raise exception 'CREDENTIAL_CHANGED_RELOAD'; end if;
 return jsonb_build_object('id',r.id,'credential_no',r.credential_no,'updated_at',r.updated_at);
end $$;
revoke all on function public.ica_change_credential_number(uuid,text,text,timestamptz) from public,anon;
grant execute on function public.ica_change_credential_number(uuid,text,text,timestamptz) to authenticated;
CREATE OR REPLACE FUNCTION public.ica_issue_credential(p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$ declare v_issuer public.ica_issuers%rowtype; v_type public.ica_credential_types%rowtype; v_rule public.ica_number_rules%rowtype; v_id uuid; v_no text; v_manual text:=nullif(btrim(p_data->>'credential_no'),''); begin if auth.uid() is null or not private.ica_is_admin() then raise exception 'ICA_ADMIN_REQUIRED'; end if; select * into v_issuer from public.ica_issuers where code=upper(btrim(p_data->>'issuer_code')) and is_active; select * into v_type from public.ica_credential_types where code=upper(btrim(p_data->>'type_code')) and is_active; if v_issuer.id is null or v_type.id is null then raise exception 'INVALID_ISSUER_OR_TYPE'; end if; if nullif(btrim(p_data->>'person_name'),'') is null then raise exception 'PERSON_NAME_REQUIRED'; end if; perform pg_advisory_xact_lock(820906); select * into v_rule from public.ica_number_rules where issuer_id=v_issuer.id and credential_type_id=v_type.id and is_active for update; if v_rule.id is null then raise exception 'NUMBER_RULE_NOT_FOUND'; end if; if v_manual is not null then v_no:=v_manual; else v_no:=v_rule.prefix||v_rule.separator||lpad(v_rule.next_value::text,v_rule.digits,'0'); end if; insert into public.ica_credentials(credential_no,issuer_id,credential_type_id,detail_type_id,detail_label,person_name,person_name_en,photo_url,qualification_name,discipline,rank_grade,position_title,birth_date,issued_on,valid_until,phone,email,postal_code,address,address_detail,admin_note,status,card_requested,document_requested,created_by) values(v_no,v_issuer.id,v_type.id,nullif(p_data->>'detail_type_id','')::uuid,nullif(btrim(p_data->>'detail_label'),''),btrim(p_data->>'person_name'),nullif(btrim(p_data->>'person_name_en'),''),nullif(btrim(p_data->>'photo_url'),''),nullif(btrim(p_data->>'qualification_name'),''),nullif(btrim(p_data->>'discipline'),''),nullif(btrim(p_data->>'rank_grade'),''),nullif(btrim(p_data->>'position_title'),''),nullif(p_data->>'birth_date','')::date,coalesce(nullif(p_data->>'issued_on','')::date,current_date),nullif(p_data->>'valid_until','')::date,nullif(btrim(p_data->>'phone'),''),nullif(btrim(p_data->>'email'),''),nullif(btrim(p_data->>'postal_code'),''),nullif(btrim(p_data->>'address'),''),nullif(btrim(p_data->>'address_detail'),''),nullif(btrim(p_data->>'admin_note'),''),'VALID',coalesce((p_data->>'card_requested')::boolean,v_type.default_card),coalesce((p_data->>'document_requested')::boolean,v_type.default_document),auth.uid()) returning id into v_id; if v_manual is null then update public.ica_number_rules set next_value=next_value+1,updated_at=now() where id=v_rule.id; end if; insert into public.ica_status_history(credential_id,old_status,new_status,reason,changed_by) values(v_id,null,'VALID','INITIAL_ISSUE',auth.uid()); return jsonb_build_object('id',v_id,'credential_no',v_no); end; $function$


create or replace function public.ica_change_credential_number(p_id uuid,p_old_no text,p_new_no text,p_updated_at timestamptz) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.ica_credentials%rowtype; ctx jsonb;
begin
 ctx:=public.gms_get_my_admin_context();
 if auth.uid() is null or not coalesce((ctx->>'is_admin')::boolean,false) or coalesce(ctx->>'role','') not in ('founder','master') then raise exception 'ICA_MASTER_REQUIRED'; end if;
 update public.ica_credentials set credential_no=btrim(p_new_no) where id=p_id and credential_no=p_old_no and updated_at=p_updated_at returning * into r;
 if not found then raise exception 'CREDENTIAL_CHANGED_RELOAD'; end if;
 return jsonb_build_object('id',r.id,'credential_no',r.credential_no,'updated_at',r.updated_at);
end $$;
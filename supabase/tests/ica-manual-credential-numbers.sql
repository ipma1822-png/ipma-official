-- Transaction-only synthetic records; always rolls back.
begin;
select set_config('request.jwt.claim.sub',(select auth_user_id::text from gms_admin_accounts where role='master' and is_active limit 1),true);
set local role authenticated;
do $$ declare a jsonb; b jsonb; rec ica_credentials%rowtype; n bigint; begin
 select nr.next_value into n from ica_number_rules nr join ica_issuers i on i.id=nr.issuer_id join ica_credential_types t on t.id=nr.credential_type_id where i.code='WTKF' and t.code='DAN';
 a:=ica_issue_credential('{"issuer_code":"WTKF","type_code":"DAN","person_name":"ICA TEST ONLY","credential_no":"HQ82TK00906","rank_grade":"8단"}');
 b:=ica_issue_credential('{"issuer_code":"WTKF","type_code":"DAN","person_name":"ICA TEST ONLY","credential_no":"HQ82TK00907"}');
 if (select nr.next_value from ica_number_rules nr join ica_issuers i on i.id=nr.issuer_id join ica_credential_types t on t.id=nr.credential_type_id where i.code='WTKF' and t.code='DAN')<>n then raise exception 'manual consumed counter'; end if;
 begin perform ica_issue_credential('{"issuer_code":"WTKF","type_code":"DAN","person_name":"ICA TEST ONLY","credential_no":"hq82tk00906"}'); raise exception 'duplicate allowed'; exception when unique_violation then null; end;
 select * into rec from ica_credentials where id=(a->>'id')::uuid;
 perform ica_change_credential_number(rec.id,rec.credential_no,'ICA-TEST-RENAMED',rec.updated_at);
 if not exists(select 1 from ica_number_history where credential_id=rec.id and old_no='HQ82TK00906' and new_no='ICA-TEST-RENAMED') then raise exception 'audit missing'; end if;
 if ica_verify_credential('ICA-TEST-RENAMED')->>'credential_no'<>'ICA-TEST-RENAMED' or ica_verify_credential('HQ82TK00906') is not null then raise exception 'lookup mismatch'; end if;
 b:=ica_issue_credential('{"issuer_code":"WTKF","type_code":"DAN","person_name":"ICA TEST ONLY"}');
 if b->>'credential_no'<>'KOR00906' then raise exception 'auto rule changed'; end if;
 end $$;
rollback;
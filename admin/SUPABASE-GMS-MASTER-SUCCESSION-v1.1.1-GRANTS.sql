-- Data API table privileges for the central GMS administrator policies.
-- RLS remains enabled and gms_is_admin() remains the row-level authorization gate.
do $$
declare t text;
begin
  foreach t in array array[
    'activity_events','acts_member_applications','gms_legacy_members',
    'gms_admin_member_profiles','gms_global_applications',
    'gms_overseas_branches','gms_taekwonkumdo_dojangs',
    'idp_member_applications','idp_branch_applications','idp_branch_profiles',
    'idp_branch_officers','idp_center_applications','idp_official_centers',
    'idp_specialist_applications','idp_volunteer_applications',
    'idp_volunteer_evidence','idp_volunteer_programs','idp_youth_badges',
    'idp_youth_profiles','ipma_member_applications','ipma_service_applications',
    'ipma_products','ipma_payment_settings','ipma_paid_contents',
    'ipma_content_purchases','ipma_resources','ipma_resource_downloads',
    'learning_progress','membership_details','organization_memberships',
    'point_ledger','network_notices','wtkf_member_applications'
  ] loop
    if to_regclass('public.'||t) is not null then
      execute format('grant select,insert,update,delete on public.%I to authenticated',t);
    end if;
  end loop;
end $$;

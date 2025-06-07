/*
  # Grant permissions for materialized view and verify base table grants

  1. Grants
    - Grant SELECT on agent_managed_properties_view to authenticated role
    - Verify grants on underlying tables

  2. Security
    - Ensure RLS policies can function correctly
    - Prevent permission misalignment issues
*/

-- Grant SELECT on the materialized view to authenticated users
GRANT SELECT ON public.agent_managed_properties_view TO authenticated;

-- Verify and grant necessary permissions on base tables
GRANT SELECT ON public.properties TO authenticated;
GRANT SELECT ON public.agent_landlords TO authenticated;
GRANT SELECT ON public.users TO authenticated;

-- Grant usage on sequences if needed
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
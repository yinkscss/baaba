/*
  # Automate materialized view refresh

  1. Functions
    - Function to refresh agent_managed_properties_view
    - Trigger function to automatically refresh on changes

  2. Triggers
    - Refresh materialized view when agent_landlords changes
    - Refresh materialized view when properties changes
*/

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_agent_managed_properties_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.agent_managed_properties_view;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and continue (in production, you might want to use a proper logging system)
    RAISE WARNING 'Failed to refresh agent_managed_properties_view: %', SQLERRM;
END;
$$;

-- Create trigger function
CREATE OR REPLACE FUNCTION trigger_refresh_agent_managed_properties_view()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use pg_notify to signal that a refresh is needed
  -- This allows for asynchronous processing
  PERFORM pg_notify('refresh_agent_view', '');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers on agent_landlords table
DROP TRIGGER IF EXISTS agent_landlords_refresh_view ON public.agent_landlords;
CREATE TRIGGER agent_landlords_refresh_view
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_landlords
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_agent_managed_properties_view();

-- Create triggers on properties table
DROP TRIGGER IF EXISTS properties_refresh_agent_view ON public.properties;
CREATE TRIGGER properties_refresh_agent_view
  AFTER INSERT OR UPDATE OR DELETE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_agent_managed_properties_view();

-- Initial refresh of the materialized view
SELECT refresh_agent_managed_properties_view();
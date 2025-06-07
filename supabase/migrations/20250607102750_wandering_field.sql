/*
  # Create agent_managed_properties_view materialized view

  1. Materialized View
    - `agent_managed_properties_view`
      - Pre-computes which properties are managed by which agents
      - Joins properties with agent_landlords table
      - Includes property_id and agent_id

  2. Performance
    - Optimizes RLS checks on properties table
    - Reduces query complexity for agent property access
*/

-- Create materialized view for agent managed properties
CREATE MATERIALIZED VIEW IF NOT EXISTS public.agent_managed_properties_view AS
SELECT 
  p.id AS property_id,
  al.agent_id
FROM public.properties p
JOIN public.agent_landlords al ON p.landlord_id = al.landlord_id;

-- Create index on the materialized view for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_managed_properties_unique 
  ON public.agent_managed_properties_view(property_id, agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_managed_properties_agent_id 
  ON public.agent_managed_properties_view(agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_managed_properties_property_id 
  ON public.agent_managed_properties_view(property_id);

-- Grant permissions
GRANT SELECT ON public.agent_managed_properties_view TO authenticated;
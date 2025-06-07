/*
  # Update properties RLS policy for agents

  1. Policy Updates
    - Modify existing properties RLS policy
    - Allow agents to manage properties through agent_managed_properties_view
    - Maintain existing landlord access

  2. Security
    - Agents can only access properties they are authorized to manage
    - Landlords retain full access to their properties
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Landlords and agents can manage their properties" ON public.properties;

-- Create updated policy that includes agent access via materialized view
CREATE POLICY "Landlords and agents can manage their properties"
  ON public.properties
  FOR ALL
  TO authenticated
  USING (
    -- Landlord access (existing)
    (auth.uid() = landlord_id AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('landlord', 'agent')
    ))
    OR
    -- Agent access via materialized view (new)
    (EXISTS (
      SELECT 1 FROM public.agent_managed_properties_view ampv
      WHERE ampv.property_id = id 
      AND ampv.agent_id = auth.uid()
    ))
  )
  WITH CHECK (
    -- Landlord access (existing)
    (auth.uid() = landlord_id AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('landlord', 'agent')
    ))
    OR
    -- Agent access via materialized view (new)
    (EXISTS (
      SELECT 1 FROM public.agent_managed_properties_view ampv
      WHERE ampv.property_id = id 
      AND ampv.agent_id = auth.uid()
    ))
  );
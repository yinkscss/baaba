/*
  # Fix Properties Table RLS Policy for Insert Operations

  1. Policy Changes
    - Drop the existing overly restrictive policy
    - Create separate policies for INSERT and other operations
    - Allow landlords to insert properties where they are the landlord
    - Allow agents to insert properties (they can manage properties for landlords)

  2. Security
    - Maintain RLS on properties table
    - Ensure users can only insert properties with proper role validation
    - Separate INSERT policy from SELECT/UPDATE/DELETE policies
*/

-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Landlords and agents can manage their properties" ON properties;

-- Create a policy specifically for INSERT operations
CREATE POLICY "Landlords and agents can insert properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be a landlord or agent
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('landlord', 'agent')
    )
    AND (
      -- If user is a landlord, they must be the landlord_id
      (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'landlord'
      ) AND auth.uid() = landlord_id)
      OR
      -- If user is an agent, they can insert properties for any landlord
      (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'agent'
      ))
    )
  );

-- Create a policy for SELECT operations (viewing properties)
CREATE POLICY "Users can view available properties and manage own"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    -- Anyone can view available properties
    available = true
    OR
    -- Landlords can view their own properties
    (auth.uid() = landlord_id)
    OR
    -- Agents can view properties they manage
    (EXISTS (
      SELECT 1 FROM agent_managed_properties_view ampv
      WHERE ampv.property_id = properties.id 
      AND ampv.agent_id = auth.uid()
    ))
  );

-- Create a policy for UPDATE operations
CREATE POLICY "Landlords and agents can update their properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (
    -- Landlords can update their own properties
    (auth.uid() = landlord_id AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('landlord', 'agent')
    ))
    OR
    -- Agents can update properties they manage
    (EXISTS (
      SELECT 1 FROM agent_managed_properties_view ampv
      WHERE ampv.property_id = properties.id 
      AND ampv.agent_id = auth.uid()
    ))
  )
  WITH CHECK (
    -- Same conditions for the updated data
    (auth.uid() = landlord_id AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('landlord', 'agent')
    ))
    OR
    (EXISTS (
      SELECT 1 FROM agent_managed_properties_view ampv
      WHERE ampv.property_id = properties.id 
      AND ampv.agent_id = auth.uid()
    ))
  );

-- Create a policy for DELETE operations
CREATE POLICY "Landlords and agents can delete their properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (
    -- Landlords can delete their own properties
    (auth.uid() = landlord_id AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('landlord', 'agent')
    ))
    OR
    -- Agents can delete properties they manage
    (EXISTS (
      SELECT 1 FROM agent_managed_properties_view ampv
      WHERE ampv.property_id = properties.id 
      AND ampv.agent_id = auth.uid()
    ))
  );

-- Keep the existing public SELECT policy for unauthenticated users
-- This should already exist, but let's ensure it's there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Anyone can view available properties'
  ) THEN
    CREATE POLICY "Anyone can view available properties"
      ON properties
      FOR SELECT
      TO public
      USING (available = true);
  END IF;
END $$;
/*
  # Fix Inspection Requests and Notifications System

  1. Schema Updates
    - Add missing columns to inspection_requests table
    - Update RLS policies for better access control
    - Add proper indexes for performance

  2. Notification System
    - Create notification triggers for inspection requests
    - Add automatic notification creation

  3. Security
    - Update RLS policies to handle agent access properly
    - Ensure proper data isolation
*/

-- Add missing columns to inspection_requests if they don't exist
DO $$ 
BEGIN
  -- Add property title and address for easier querying
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inspection_requests' 
    AND column_name = 'property_title'
  ) THEN
    ALTER TABLE public.inspection_requests 
    ADD COLUMN property_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inspection_requests' 
    AND column_name = 'property_address'
  ) THEN
    ALTER TABLE public.inspection_requests 
    ADD COLUMN property_address text;
  END IF;

  -- Add tenant information for easier access
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inspection_requests' 
    AND column_name = 'tenant_name'
  ) THEN
    ALTER TABLE public.inspection_requests 
    ADD COLUMN tenant_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inspection_requests' 
    AND column_name = 'tenant_email'
  ) THEN
    ALTER TABLE public.inspection_requests 
    ADD COLUMN tenant_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inspection_requests' 
    AND column_name = 'tenant_phone'
  ) THEN
    ALTER TABLE public.inspection_requests 
    ADD COLUMN tenant_phone text;
  END IF;
END $$;

-- Update RLS policies for inspection requests to include agent access
DROP POLICY IF EXISTS "Landlords can manage property inspection requests" ON public.inspection_requests;
DROP POLICY IF EXISTS "Agents can manage property inspection requests" ON public.inspection_requests;

-- Create comprehensive policy for landlords and agents
CREATE POLICY "Landlords and agents can manage property inspection requests"
  ON public.inspection_requests
  FOR ALL
  TO authenticated
  USING (
    -- Landlords can manage requests for their properties
    property_id IN (
      SELECT id FROM public.properties 
      WHERE landlord_id = auth.uid()
    )
    OR
    -- Agents can manage requests for properties they manage
    property_id IN (
      SELECT ampv.property_id 
      FROM public.agent_managed_properties_view ampv
      WHERE ampv.agent_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Same conditions for inserts/updates
    property_id IN (
      SELECT id FROM public.properties 
      WHERE landlord_id = auth.uid()
    )
    OR
    property_id IN (
      SELECT ampv.property_id 
      FROM public.agent_managed_properties_view ampv
      WHERE ampv.agent_id = auth.uid()
    )
  );

-- Create function to automatically populate inspection request details
CREATE OR REPLACE FUNCTION populate_inspection_request_details()
RETURNS TRIGGER AS $$
BEGIN
  -- Populate property details
  SELECT title, address INTO NEW.property_title, NEW.property_address
  FROM public.properties
  WHERE id = NEW.property_id;

  -- Populate tenant details
  SELECT 
    CONCAT(first_name, ' ', last_name),
    email,
    phone_number
  INTO 
    NEW.tenant_name,
    NEW.tenant_email,
    NEW.tenant_phone
  FROM public.users
  WHERE id = NEW.tenant_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to populate details on insert
DROP TRIGGER IF EXISTS populate_inspection_request_details_trigger ON public.inspection_requests;
CREATE TRIGGER populate_inspection_request_details_trigger
  BEFORE INSERT ON public.inspection_requests
  FOR EACH ROW
  EXECUTE FUNCTION populate_inspection_request_details();

-- Create function to send notifications for inspection requests
CREATE OR REPLACE FUNCTION notify_inspection_request_status_change()
RETURNS TRIGGER AS $$
DECLARE
  landlord_id uuid;
  agent_ids uuid[];
  notification_message text;
BEGIN
  -- Get the landlord for this property
  SELECT p.landlord_id INTO landlord_id
  FROM public.properties p
  WHERE p.id = NEW.property_id;

  -- Get any agents managing this property
  SELECT ARRAY_AGG(ampv.agent_id) INTO agent_ids
  FROM public.agent_managed_properties_view ampv
  WHERE ampv.property_id = NEW.property_id;

  -- Handle different status changes
  IF TG_OP = 'INSERT' THEN
    -- New inspection request
    notification_message := 'New inspection request for ' || NEW.property_title || ' from ' || NEW.tenant_name;
    
    -- Notify landlord
    INSERT INTO public.notifications (user_id, type, message)
    VALUES (landlord_id, 'inspection_request', notification_message);
    
    -- Notify agents
    IF agent_ids IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, message)
      SELECT unnest(agent_ids), 'inspection_request', notification_message;
    END IF;

  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Status change notification to tenant
    CASE NEW.status
      WHEN 'approved' THEN
        notification_message := 'Your inspection request for ' || NEW.property_title || ' has been approved';
      WHEN 'rejected' THEN
        notification_message := 'Your inspection request for ' || NEW.property_title || ' has been rejected';
      ELSE
        notification_message := 'Your inspection request for ' || NEW.property_title || ' status has been updated';
    END CASE;

    -- Notify tenant
    INSERT INTO public.notifications (user_id, type, message)
    VALUES (NEW.tenant_id, 'inspection_request', notification_message);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for inspection request notifications
DROP TRIGGER IF EXISTS inspection_request_notification_trigger ON public.inspection_requests;
CREATE TRIGGER inspection_request_notification_trigger
  AFTER INSERT OR UPDATE ON public.inspection_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_inspection_request_status_change();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inspection_requests_property_id ON public.inspection_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_inspection_requests_tenant_id ON public.inspection_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inspection_requests_status ON public.inspection_requests(status);
CREATE INDEX IF NOT EXISTS idx_inspection_requests_requested_date ON public.inspection_requests(requested_date);

-- Create index on notifications for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
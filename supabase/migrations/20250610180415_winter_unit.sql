/*
  # Enhance Inspection Request Workflow

  1. Database Schema Updates
    - Add `tenant_confirmed_inspection` column to `escrow_transactions` table
    - Add `rescheduled_by` and `reschedule_notes` columns to `inspection_requests` table
    - Update status enum to include 'rescheduled' status
    - Update trigger function for notifications

  2. Security
    - Maintain existing RLS policies
    - Add appropriate constraints and indexes
*/

-- Add tenant_confirmed_inspection column to escrow_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'escrow_transactions' AND column_name = 'tenant_confirmed_inspection'
  ) THEN
    ALTER TABLE escrow_transactions ADD COLUMN tenant_confirmed_inspection boolean DEFAULT false;
  END IF;
END $$;

-- Add rescheduled_by and reschedule_notes columns to inspection_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspection_requests' AND column_name = 'rescheduled_by'
  ) THEN
    ALTER TABLE inspection_requests ADD COLUMN rescheduled_by uuid REFERENCES users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspection_requests' AND column_name = 'reschedule_notes'
  ) THEN
    ALTER TABLE inspection_requests ADD COLUMN reschedule_notes text;
  END IF;
END $$;

-- Update the status check constraint to include 'rescheduled'
ALTER TABLE inspection_requests DROP CONSTRAINT IF EXISTS inspection_requests_status_check;
ALTER TABLE inspection_requests ADD CONSTRAINT inspection_requests_status_check 
  CHECK (status = ANY (ARRAY['new'::text, 'approved'::text, 'rejected'::text, 'rescheduled'::text]));

-- Create or replace the notification trigger function
CREATE OR REPLACE FUNCTION notify_inspection_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify tenant when status changes to approved or rescheduled
  IF (NEW.status = 'approved' OR NEW.status = 'rescheduled') AND OLD.status != NEW.status THEN
    INSERT INTO notifications (user_id, type, message)
    VALUES (
      NEW.tenant_id,
      'inspection_request',
      CASE 
        WHEN NEW.status = 'approved' THEN 'Your inspection request has been approved!'
        WHEN NEW.status = 'rescheduled' THEN 'Your inspection request has been rescheduled. Please check the new details.'
        ELSE 'Your inspection request status has been updated.'
      END
    );
  END IF;

  -- Notify landlord/agent when status changes to any status (for their awareness)
  IF OLD.status != NEW.status THEN
    -- Get the landlord_id from the property
    INSERT INTO notifications (user_id, type, message)
    SELECT 
      p.landlord_id,
      'inspection_request',
      'Inspection request status updated for property: ' || p.title
    FROM properties p
    WHERE p.id = NEW.property_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for escrow transaction updates
CREATE OR REPLACE FUNCTION notify_escrow_inspection_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify landlord when tenant confirms inspection
  IF NEW.tenant_confirmed_inspection = true AND OLD.tenant_confirmed_inspection = false THEN
    INSERT INTO notifications (user_id, type, message)
    SELECT 
      p.landlord_id,
      'inspection_request',
      'Tenant has confirmed inspection completion. Funds can now be released.'
    FROM leases l
    JOIN properties p ON l.property_id = p.id
    WHERE l.id = NEW.lease_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for escrow transaction updates
DROP TRIGGER IF EXISTS escrow_inspection_confirmation_trigger ON escrow_transactions;
CREATE TRIGGER escrow_inspection_confirmation_trigger
  AFTER UPDATE ON escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_escrow_inspection_confirmation();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inspection_requests_rescheduled_by ON inspection_requests(rescheduled_by);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_tenant_confirmed ON escrow_transactions(tenant_confirmed_inspection);
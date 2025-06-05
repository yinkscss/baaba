/*
  # Add Landlord Dashboard Features

  1. New Tables
    - inspection_requests
      - id (uuid, primary key)
      - property_id (uuid, references properties)
      - tenant_id (uuid, references users)
      - requested_date (timestamptz)
      - message (text)
      - status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - escrow_transactions
      - id (uuid, primary key)
      - lease_id (uuid, references leases)
      - amount (numeric)
      - status (text)
      - initiated_at (timestamptz)
      - released_at (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for tenants and landlords
*/

-- Add status column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS status text 
CHECK (status IN ('active', 'paused', 'rented')) 
DEFAULT 'active';

-- Create inspection_requests table
CREATE TABLE IF NOT EXISTS public.inspection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id),
  tenant_id uuid NOT NULL REFERENCES public.users(id),
  requested_date timestamptz NOT NULL,
  message text NOT NULL,
  status text NOT NULL CHECK (status IN ('new', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on inspection_requests
ALTER TABLE public.inspection_requests ENABLE ROW LEVEL SECURITY;

-- Create inspection_requests policies
CREATE POLICY "Tenants can view own inspection requests"
  ON public.inspection_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can create inspection requests"
  ON public.inspection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Landlords can manage property inspection requests"
  ON public.inspection_requests
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE landlord_id = auth.uid()
    )
  )
  WITH CHECK (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE landlord_id = auth.uid()
    )
  );

-- Create escrow_transactions table
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid NOT NULL REFERENCES public.leases(id),
  amount numeric NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('pending_release', 'released', 'refunded')),
  initiated_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on escrow_transactions
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Create escrow_transactions policies
CREATE POLICY "Tenants can view own escrow transactions"
  ON public.escrow_transactions
  FOR SELECT
  TO authenticated
  USING (
    lease_id IN (
      SELECT id FROM public.leases 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage escrow transactions"
  ON public.escrow_transactions
  FOR ALL
  TO authenticated
  USING (
    lease_id IN (
      SELECT l.id FROM public.leases l
      JOIN public.properties p ON l.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  )
  WITH CHECK (
    lease_id IN (
      SELECT l.id FROM public.leases l
      JOIN public.properties p ON l.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

-- Add verification columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS school_id_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- Create triggers for updated_at columns
CREATE TRIGGER update_inspection_requests_updated_at
  BEFORE UPDATE ON public.inspection_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_transactions_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
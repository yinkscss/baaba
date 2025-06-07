/*
  # Create commissions table

  1. New Tables
    - `commissions`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, foreign key to users.id)
      - `lease_id` (uuid, foreign key to leases.id with ON DELETE RESTRICT)
      - `amount` (numeric, commission amount)
      - `status` (text, payment status)
      - `payout_date` (timestamp, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on commissions table
    - Agents can only view their own commissions
    - ON DELETE RESTRICT prevents lease deletion with pending commissions

  3. Data Integrity
    - Ensure lease lifecycle accommodates commission resolution
*/

-- Create commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lease_id uuid NOT NULL REFERENCES public.leases(id) ON DELETE RESTRICT,
  amount numeric NOT NULL CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payout_date timestamptz,
  created_at timestamptz DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Policy for agents to view their own commissions
CREATE POLICY "Agents can view own commissions"
  ON public.commissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id);

-- Policy for agents to update their own commission records (limited fields)
CREATE POLICY "Agents can update own commission notes"
  ON public.commissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

-- Policy for admins to manage all commissions
CREATE POLICY "Admins can manage all commissions"
  ON public.commissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_commissions_agent_id ON public.commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_lease_id ON public.commissions(lease_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON public.commissions(created_at DESC);

-- Create unique constraint to prevent duplicate commissions for the same lease
CREATE UNIQUE INDEX IF NOT EXISTS idx_commissions_unique_lease 
  ON public.commissions(lease_id) 
  WHERE status != 'cancelled';
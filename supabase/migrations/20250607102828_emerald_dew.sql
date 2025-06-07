/*
  # Create verification_requests table

  1. New Tables
    - `verification_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `type` (text, verification type)
      - `document_url` (text, document URL)
      - `status` (text, request status)
      - `submitted_at` (timestamp)
      - `reviewed_by` (uuid, foreign key to users.id, nullable)
      - `reviewed_at` (timestamp, nullable)

  2. Security
    - Enable RLS on verification_requests table
    - Users can view their own requests
    - Agents/admins can manage pending requests with type restrictions
*/

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('tenant_id_verification', 'landlord_contract_verification', 'agent_license_verification')),
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES public.users(id),
  reviewed_at timestamptz,
  notes text
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own requests
CREATE POLICY "Users can view own verification requests"
  ON public.verification_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to create their own requests
CREATE POLICY "Users can create own verification requests"
  ON public.verification_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for agents/admins to view and manage requests
CREATE POLICY "Agents can manage verification requests"
  ON public.verification_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('agent', 'admin')
    )
    AND (status = 'pending' OR reviewed_by = auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('agent', 'admin')
    )
    AND (status = 'pending' OR reviewed_by = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_type ON public.verification_requests(type);
CREATE INDEX IF NOT EXISTS idx_verification_requests_reviewed_by ON public.verification_requests(reviewed_by);
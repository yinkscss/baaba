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

-- Enable RLS
ALTER TABLE public.inspection_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tenants can create inspection requests" ON public.inspection_requests;
DROP POLICY IF EXISTS "Tenants can view own inspection requests" ON public.inspection_requests;
DROP POLICY IF EXISTS "Landlords can manage property inspection requests" ON public.inspection_requests;

-- Create policies
CREATE POLICY "Tenants can create inspection requests"
  ON public.inspection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can view own inspection requests"
  ON public.inspection_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = tenant_id);

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

-- Enable RLS
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tenants can view own escrow transactions" ON public.escrow_transactions;
DROP POLICY IF EXISTS "Landlords can manage escrow transactions" ON public.escrow_transactions;

-- Create policies
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

-- Create triggers for updated_at columns
CREATE TRIGGER update_inspection_requests_updated_at
  BEFORE UPDATE ON public.inspection_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_transactions_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
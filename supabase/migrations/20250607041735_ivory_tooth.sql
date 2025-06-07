-- Create leases table
CREATE TABLE IF NOT EXISTS public.leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  property_id uuid NOT NULL REFERENCES public.properties(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  rent_amount numeric NOT NULL CHECK (rent_amount >= 0),
  lease_document_url text,
  landlord_contact_id uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on leases
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tenants can read own lease details" ON public.leases;
DROP POLICY IF EXISTS "Landlords can read associated leases" ON public.leases;
DROP POLICY IF EXISTS "Users can insert own lease" ON public.leases;
DROP POLICY IF EXISTS "Users can update own lease" ON public.leases;

-- Create leases policies
CREATE POLICY "Tenants can read own lease details"
  ON public.leases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Landlords can read associated leases"
  ON public.leases
  FOR SELECT
  TO authenticated
  USING (
    landlord_contact_id = auth.uid() OR 
    property_id IN (
      SELECT id FROM public.properties 
      WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own lease"
  ON public.leases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lease"
  ON public.leases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid NOT NULL REFERENCES public.leases(id),
  amount numeric NOT NULL CHECK (amount >= 0),
  payment_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')),
  transaction_id text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tenants can read own payments" ON public.payments;
DROP POLICY IF EXISTS "Landlords can read property payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert payments" ON public.payments;

-- Create payments policies
CREATE POLICY "Tenants can read own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    lease_id IN (
      SELECT id FROM public.leases 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can read property payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    lease_id IN (
      SELECT l.id FROM public.leases l
      JOIN public.properties p ON l.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    lease_id IN (
      SELECT id FROM public.leases 
      WHERE user_id = auth.uid()
    )
  );

-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  property_id uuid REFERENCES public.properties(id),
  subject text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('maintenance', 'noise', 'billing', 'security', 'other')),
  status text NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  resolution_notes text,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tenants can manage own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Landlords can manage property complaints" ON public.complaints;

-- Create complaints policies
CREATE POLICY "Tenants can manage own complaints"
  ON public.complaints
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Landlords can manage property complaints"
  ON public.complaints
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

-- Create triggers for updated_at columns
CREATE TRIGGER update_leases_updated_at
  BEFORE UPDATE ON public.leases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
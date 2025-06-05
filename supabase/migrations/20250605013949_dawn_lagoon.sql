/*
  # Database Schema Updates
  
  1. Changes
    - Add notification_preferences to users table
    - Create leases table with RLS policies
    - Create payments table with RLS policies
    - Create complaints table with RLS policies
    - Add updated_at triggers
  
  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for tenants and landlords
    
  3. Notes
    - All policies are created only if they don't exist
    - Added checks for existing triggers
*/

-- Add notification_preferences to users table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE public.users ADD COLUMN notification_preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

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

-- Create leases policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leases' 
    AND policyname = 'Tenants can read own lease details'
  ) THEN
    CREATE POLICY "Tenants can read own lease details"
      ON public.leases
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leases' 
    AND policyname = 'Landlords can read associated leases'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leases' 
    AND policyname = 'Users can insert own lease'
  ) THEN
    CREATE POLICY "Users can insert own lease"
      ON public.leases
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leases' 
    AND policyname = 'Users can update own lease'
  ) THEN
    CREATE POLICY "Users can update own lease"
      ON public.leases
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

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

-- Create payments policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Tenants can read own payments'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Landlords can read property payments'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Users can insert payments'
  ) THEN
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
  END IF;
END $$;

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

-- Create complaints policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'complaints' 
    AND policyname = 'Tenants can manage own complaints'
  ) THEN
    CREATE POLICY "Tenants can manage own complaints"
      ON public.complaints
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'complaints' 
    AND policyname = 'Landlords can manage property complaints'
  ) THEN
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
  END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_leases_updated_at'
  ) THEN
    CREATE TRIGGER update_leases_updated_at
      BEFORE UPDATE ON public.leases
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_complaints_updated_at'
  ) THEN
    CREATE TRIGGER update_complaints_updated_at
      BEFORE UPDATE ON public.complaints
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
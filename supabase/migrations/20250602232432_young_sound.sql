/*
  # Fix users table policies

  1. Changes
    - Drop existing policies if they exist
    - Recreate policies for users table:
      - Read own data
      - Insert own data
      - Update own data
    - Ensure RLS is enabled
*/

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own data" ON public.users;
    DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
    DROP POLICY IF EXISTS "Users can update own data" ON public.users;
END $$;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy for users to insert their own data during registration
CREATE POLICY "Users can insert own data"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
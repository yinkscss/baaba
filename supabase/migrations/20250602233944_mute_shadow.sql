/*
  # Create users table and policies

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `role` (text, check constraint for 'tenant' or 'landlord')
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Reading own data
      - Updating own data
      - Inserting data (auth service)
      - Inserting own data
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('tenant', 'landlord')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own data" ON public.users;
  DROP POLICY IF EXISTS "Users can update own data" ON public.users;
  DROP POLICY IF EXISTS "Enable insert for authentication service" ON public.users;
  DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
END $$;

-- Create policies
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authentication service"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
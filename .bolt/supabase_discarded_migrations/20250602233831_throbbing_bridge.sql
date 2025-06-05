/*
  # User Authentication Schema

  1. New Tables
    - `users` table with:
      - `id` (uuid, primary key) - Links to auth.users
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text) 
      - `role` (text, check constraint for 'tenant' or 'landlord')
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for:
      - Users can read their own data
      - Users can update their own data
      - Auth service can insert data
      - Users can insert their own data
*/

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('tenant', 'landlord')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow auth service to insert data
CREATE POLICY "Enable insert for authentication service"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own data
CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
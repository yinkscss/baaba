/*
  # Create users table with RLS policies

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `first_name` (text, not null)
      - `last_name` (text, not null)
      - `role` (text, not null, check constraint for 'tenant' or 'landlord')
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Users can read their own data
      - Users can update their own data
      - Users can insert their own data
      - Auth service can insert data during signup
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT users_role_check CHECK (role IN ('tenant', 'landlord'))
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
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

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authentication service"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);
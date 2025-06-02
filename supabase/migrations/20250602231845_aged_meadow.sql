/*
  # Create users table and security policies

  1. New Tables
    - `users` table for storing user profiles
      - `id` (uuid, primary key) - references auth.users
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `role` (text) - either 'tenant' or 'landlord'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for:
      - Insert: Allow public to insert during signup
      - Select: Allow authenticated users to read their own data
      - Update: Allow users to update their own data
*/

-- Create users table
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

-- Policies
CREATE POLICY "Enable insert for authentication service" ON public.users
  FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
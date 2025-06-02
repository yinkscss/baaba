/*
  # Fix users table RLS policies

  1. Changes
    - Add RLS policies for the users table to ensure proper access control
    
  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Authenticated users can read their own data
      - Users can insert their own data during registration
      - Users can update their own data
*/

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

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
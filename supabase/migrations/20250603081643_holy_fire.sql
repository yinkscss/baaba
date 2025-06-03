/*
  # Update users table role constraints

  1. Changes
    - Add 'pending' and 'agent' as valid role values
    - Update existing role check constraint

  2. Security
    - Maintains existing RLS policies
    - No data loss - existing roles remain valid
*/

-- Drop existing role check constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new role check constraint with 'pending' and 'agent'
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role = ANY (ARRAY['tenant'::text, 'landlord'::text, 'agent'::text, 'pending'::text]));
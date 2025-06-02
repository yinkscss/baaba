/*
  # Add verified column to users table

  1. Changes
    - Add `verified` boolean column to `users` table with default value of false
    - This column will track whether a user has completed verification

  2. Security
    - No changes to RLS policies needed as this is just adding a column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'verified'
  ) THEN
    ALTER TABLE users ADD COLUMN verified boolean DEFAULT false;
  END IF;
END $$;
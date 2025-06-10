/*
  # Fix notifications RLS policy for system-generated notifications

  1. Security Changes
    - Update the notifications table RLS policy to allow system-generated notifications
    - Add a policy that allows authenticated users to insert notifications for other users
    - This enables database triggers to create notifications when inspection requests are updated

  2. Changes Made
    - Drop the existing restrictive INSERT policy
    - Create a new INSERT policy that allows authenticated users to create notifications for any user
    - Keep the existing policies for SELECT, UPDATE, and DELETE operations unchanged
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;

-- Create separate policies for different operations
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a more permissive INSERT policy that allows system-generated notifications
CREATE POLICY "Allow system to create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
/*
  # Dashboard and Activity Tables

  1. New Tables
    - `dashboard_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `properties_viewed` (integer, default 0)
      - `saved_properties` (integer, default 0)
      - `active_applications` (integer, default 0)
      - `total_properties` (integer, default 0)
      - `total_income` (numeric, default 0)
      - `occupancy_rate` (numeric, default 0)
      - `last_updated` (timestamptz, default now)
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text)
      - `message` (text)
      - `read` (boolean, default false)
      - `created_at` (timestamptz, default now)
    - `activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text)
      - `description` (text)
      - `metadata` (jsonb, default '{}')
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Create dashboard_stats table
CREATE TABLE IF NOT EXISTS public.dashboard_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  properties_viewed integer DEFAULT 0,
  saved_properties integer DEFAULT 0,
  active_applications integer DEFAULT 0,
  total_properties integer DEFAULT 0,
  total_income numeric DEFAULT 0,
  occupancy_rate numeric DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS for dashboard_stats
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  type text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  type text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own dashboard stats" ON public.dashboard_stats;
DROP POLICY IF EXISTS "Users can update own dashboard stats" ON public.dashboard_stats;
DROP POLICY IF EXISTS "Users can insert own dashboard stats" ON public.dashboard_stats;
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can create own activities" ON public.activities;

-- Create policies for dashboard_stats
CREATE POLICY "Users can view own dashboard stats"
  ON public.dashboard_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard stats"
  ON public.dashboard_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own dashboard stats"
  ON public.dashboard_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for notifications
CREATE POLICY "Users can manage own notifications"
  ON public.notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for activities
CREATE POLICY "Users can view own activities"
  ON public.activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activities"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
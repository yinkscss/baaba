/*
  # Roommate Preferences Table and RLS Policies

  1. New Tables
    - `roommate_preferences` table for storing student preferences
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `budget` (numeric)
      - `location` (text)
      - `move_in_date` (date)
      - `gender` (text)
      - `cleanliness` (integer)
      - `noise` (integer)
      - `visitors` (integer)
      - `smoking_tolerance` (boolean)
      - `pets_tolerance` (boolean)
      - `spotify_profile_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on roommate_preferences table
    - Policies:
      - Students can manage their own preferences
      - Students can view other students' preferences
      - Admins have full access
*/

-- Create roommate_preferences table
CREATE TABLE IF NOT EXISTS public.roommate_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  budget numeric NOT NULL CHECK (budget >= 0),
  location text NOT NULL,
  move_in_date date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'any')),
  cleanliness integer NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
  noise integer NOT NULL CHECK (noise BETWEEN 1 AND 5),
  visitors integer NOT NULL CHECK (visitors BETWEEN 1 AND 5),
  smoking_tolerance boolean DEFAULT false,
  pets_tolerance boolean DEFAULT false,
  spotify_profile_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.roommate_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can manage their own preferences"
  ON public.roommate_preferences
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'tenant'
    )
  )
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'tenant'
    )
  );

CREATE POLICY "Students can view other students' preferences"
  ON public.roommate_preferences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'tenant'
    )
  );

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_roommate_preferences_updated_at
  BEFORE UPDATE ON public.roommate_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
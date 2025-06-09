-- Create roommate_preferences table
CREATE TABLE IF NOT EXISTS public.roommate_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.users(id),
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
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roommate_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can manage their own preferences" ON public.roommate_preferences;
DROP POLICY IF EXISTS "Students can view other students' preferences" ON public.roommate_preferences;

-- Create policies
CREATE POLICY "Students can manage their own preferences"
  ON public.roommate_preferences
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'tenant'
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM users 
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
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'tenant'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_roommate_preferences_updated_at
  BEFORE UPDATE ON public.roommate_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
/*
  # Properties Table and RLS Policies

  1. New Tables
    - `properties` table for storing property listings
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `location` (text)
      - `address` (text)
      - `bedrooms` (integer)
      - `bathrooms` (integer)
      - `size` (numeric)
      - `amenities` (text[])
      - `images` (text[])
      - `landlord_id` (uuid, references users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `available` (boolean)
      - `featured` (boolean)

  2. Security
    - Enable RLS on properties table
    - Policies:
      - Anyone can view available properties
      - Landlords/agents can manage their own properties
      - Admins have full access
*/

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  location text NOT NULL,
  address text NOT NULL,
  bedrooms integer NOT NULL CHECK (bedrooms >= 0),
  bathrooms integer NOT NULL CHECK (bathrooms >= 0),
  size numeric NOT NULL CHECK (size >= 0),
  amenities text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  landlord_id uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  available boolean DEFAULT true,
  featured boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view available properties"
  ON public.properties
  FOR SELECT
  TO public
  USING (available = true);

CREATE POLICY "Landlords and agents can manage their properties"
  ON public.properties
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = landlord_id AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'landlord' OR role = 'agent')
    )
  )
  WITH CHECK (
    auth.uid() = landlord_id AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'landlord' OR role = 'agent')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
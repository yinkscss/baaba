/*
  # Property Management Schema
  
  1. New Tables
    - properties: Stores property listings with details like title, price, location
  2. Security
    - Enables RLS on properties table
    - Adds policies for public viewing and landlord management
  3. Storage
    - Creates storage bucket for property images
    - Sets up policies for public access and authenticated uploads
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;
DROP POLICY IF EXISTS "Landlords and agents can manage their properties" ON public.properties;

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
  featured boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'rented'))
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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
    landlord_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'landlord' OR role = 'agent')
    )
  )
  WITH CHECK (
    landlord_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'landlord' OR role = 'agent')
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for property images if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('property-images', 'property-images')
ON CONFLICT DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to property-images" ON storage.objects;

-- Enable public access to property images
CREATE POLICY "Public Access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads to property-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');
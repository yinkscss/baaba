/*
  # Create properties table and related schemas

  1. New Tables
    - properties
      - Basic property information (title, description, price, etc.)
      - Location and physical attributes
      - Amenities and images
      - Status tracking
    
  2. Security
    - Enable RLS on properties table
    - Add policies for landlords to manage their properties
    - Add policies for public viewing of available properties

  3. Storage
    - Create storage bucket for property images
    - Add policies for image upload and access
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

-- Create updated_at trigger
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name)
VALUES ('property-images', 'property-images')
ON CONFLICT DO NOTHING;

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
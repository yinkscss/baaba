/*
  # Add property images storage bucket

  1. Changes
    - Create storage bucket for property images
    - Add public access policy for viewing images
    - Add upload policy for authenticated users
    - Add deletion policy for image owners

  2. Security
    - Public read access for property images
    - Authenticated users can upload images
    - Users can only delete their own images
*/

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property_images', 'property_images', true);

-- Allow public access to property images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property_images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property_images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (owner = auth.uid()::uuid);
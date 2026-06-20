-- Fix Storage: create required buckets and add RLS policies
-- Run this in Supabase SQL Editor

-- 1. Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 52428800, NULL),
  ('brand-assets', 'brand-assets', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Remove any existing default policies first
DROP POLICY IF EXISTS "Public select product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete product-images" ON storage.objects;

DROP POLICY IF EXISTS "Public select brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete brand-assets" ON storage.objects;

-- 3. Policies for product-images bucket
CREATE POLICY "Public select product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated insert product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated update product-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated delete product-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- 4. Policies for brand-assets bucket
CREATE POLICY "Public select brand-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-assets');

CREATE POLICY "Authenticated insert brand-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-assets');

CREATE POLICY "Authenticated update brand-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-assets');

CREATE POLICY "Authenticated delete brand-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brand-assets');

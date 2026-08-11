-- ============================================================
-- TripNest — Supabase Storage RLS Policies
-- Run this entire script in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Policy for Public/Authenticated View Access
-- Allows authenticated users to download/view files in the 'travel-photos' bucket.
CREATE POLICY "Allow authenticated users to read travel-photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'travel-photos');

-- 2. Policy for Uploading Files
-- Allows authenticated users to upload files to: travel-photos/{auth.uid()}/filename.
-- Validates:
-- - The bucket is 'travel-photos'.
-- - The first segment of the path (the folder name) matches the user's authenticated UUID.
-- - The file type is restricted to jpeg, png, or webp.
CREATE POLICY "Allow authenticated users to upload their own travel-photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'travel-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
    AND (
      storage.extension(name) = 'jpeg'
      OR storage.extension(name) = 'jpg'
      OR storage.extension(name) = 'png'
      OR storage.extension(name) = 'webp'
    )
  );

-- 3. Policy for Deleting Files
-- Allows authenticated users to delete files only from their own folder: travel-photos/{auth.uid()}/filename.
-- Prevents users from deleting other users' uploaded images.
CREATE POLICY "Allow users to delete their own travel-photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'travel-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

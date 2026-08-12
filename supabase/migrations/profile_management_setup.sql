-- ============================================================
-- SQL Migration: Profile Management Setup
-- Run this entire script in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Add travel_interests column to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS travel_interests TEXT;

-- 2. Create the 'profile-photos' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS Policy: Allow anyone (public/anon/authenticated) to read profile photos
CREATE POLICY "Allow public read access to profile-photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-photos');

-- 4. RLS Policy: Allow authenticated users to upload their own profile photos
CREATE POLICY "Allow users to upload own profile photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
    AND (
      storage.extension(name) = 'jpeg'
      OR storage.extension(name) = 'jpg'
      OR storage.extension(name) = 'png'
      OR storage.extension(name) = 'webp'
    )
  );

-- 5. RLS Policy: Allow users to delete their own profile photos
CREATE POLICY "Allow users to delete own profile photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

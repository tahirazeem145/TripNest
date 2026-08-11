-- ============================================================
-- TripNest — Posts Table & Storage Setup SQL Migration
-- Run this entire script in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Create the posts table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT         NOT NULL,
  description   TEXT,
  image_url     TEXT         NOT NULL,
  destination   TEXT         NOT NULL,
  tags          TEXT[]       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on posts table
-- ============================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Row Level Security Policies for posts table
-- ============================================================

-- Policy: Select - Authenticated users can view all posts
CREATE POLICY "Authenticated users can view all posts"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Insert - Authenticated users can insert their own posts
CREATE POLICY "Authenticated users can insert their own posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Update - Authenticated users can update their own posts only
CREATE POLICY "Authenticated users can update their own posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Delete - Authenticated users can delete their own posts only
CREATE POLICY "Authenticated users can delete their own posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Trigger to auto-update the updated_at timestamp on edit
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

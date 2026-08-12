-- ============================================================
-- TripNest — Follows Table Migration
-- Run this entire script in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ============================================================
-- 1. FOLLOWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent self-follow at DB level
  CONSTRAINT check_not_self_follow CHECK (follower_id <> following_id)
);

-- Unique constraint: follower can follow a target user only once
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'follows_follower_id_following_id_key'
  ) THEN
    ALTER TABLE public.follows ADD CONSTRAINT follows_follower_id_following_id_key UNIQUE (follower_id, following_id);
  END IF;
END $$;

-- ============================================================
-- 2. PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_follows_follower_id  ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users can view follow relationships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Authenticated users can view follows'
  ) THEN
    CREATE POLICY "Authenticated users can view follows"
      ON public.follows
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- INSERT: Authenticated users can follow only as themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can insert their own follows'
  ) THEN
    CREATE POLICY "Users can insert their own follows"
      ON public.follows
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = follower_id);
  END IF;
END $$;

-- DELETE: Authenticated users can unfollow only their own follows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can delete their own follows'
  ) THEN
    CREATE POLICY "Users can delete their own follows"
      ON public.follows
      FOR DELETE
      TO authenticated
      USING (auth.uid() = follower_id);
  END IF;
END $$;

-- ============================================================
-- Done! Follows table is ready.
-- ============================================================

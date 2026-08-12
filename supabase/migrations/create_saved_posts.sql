-- ============================================================
-- TripNest — Saved Posts / Bookmarks Table Migration
-- Run this entire script in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ============================================================
-- 1. SAVED_POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id     UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: a user can save a post only once
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_posts_user_id_post_id_key'
  ) THEN
    ALTER TABLE public.saved_posts ADD CONSTRAINT saved_posts_user_id_post_id_key UNIQUE (user_id, post_id);
  END IF;
END $$;

-- ============================================================
-- 2. PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON public.saved_posts(post_id);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users can view ONLY their own saved posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_posts' AND policyname = 'Users can view only their own saved posts'
  ) THEN
    CREATE POLICY "Users can view only their own saved posts"
      ON public.saved_posts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- INSERT: Authenticated users can save posts only for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_posts' AND policyname = 'Users can insert their own saved posts'
  ) THEN
    CREATE POLICY "Users can insert their own saved posts"
      ON public.saved_posts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- DELETE: Authenticated users can remove only their own saved posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_posts' AND policyname = 'Users can delete their own saved posts'
  ) THEN
    CREATE POLICY "Users can delete their own saved posts"
      ON public.saved_posts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- Done! Saved posts table is ready.
-- ============================================================

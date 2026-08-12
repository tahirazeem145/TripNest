-- ============================================================
-- TripNest — Likes & Comments Tables Migration
-- Run this entire script in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ============================================================
-- 1. LIKES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: a user can like a post only once
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'likes_post_id_user_id_key'
  ) THEN
    ALTER TABLE public.likes ADD CONSTRAINT likes_post_id_user_id_key UNIQUE (post_id, user_id);
  END IF;
END $$;

-- ============================================================
-- 2. COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_likes_post_id   ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id   ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- ============================================================
-- 4. UPDATED_AT TRIGGER FOR COMMENTS
-- ============================================================
-- Reuse the existing function if it exists, otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger first if it exists to avoid duplicate errors
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. ROW LEVEL SECURITY — LIKES
-- ============================================================
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users can see all likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Authenticated users can view likes'
  ) THEN
    CREATE POLICY "Authenticated users can view likes"
      ON public.likes
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- INSERT: Users can only create likes for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can insert their own likes'
  ) THEN
    CREATE POLICY "Users can insert their own likes"
      ON public.likes
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- DELETE: Users can only remove their own likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can delete their own likes'
  ) THEN
    CREATE POLICY "Users can delete their own likes"
      ON public.likes
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 6. ROW LEVEL SECURITY — COMMENTS
-- ============================================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users can see all comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Authenticated users can view comments'
  ) THEN
    CREATE POLICY "Authenticated users can view comments"
      ON public.comments
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- INSERT: Users can only create comments for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can insert their own comments'
  ) THEN
    CREATE POLICY "Users can insert their own comments"
      ON public.comments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- UPDATE: Users can only update their own comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can update their own comments'
  ) THEN
    CREATE POLICY "Users can update their own comments"
      ON public.comments
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- DELETE: Users can only delete their own comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can delete their own comments'
  ) THEN
    CREATE POLICY "Users can delete their own comments"
      ON public.comments
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- Done! Likes & Comments tables are ready.
-- ============================================================

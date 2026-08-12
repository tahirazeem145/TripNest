-- ============================================================
-- TripNest — Notifications Table and Triggers Migration
-- Run this entire script in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ============================================================
-- 1. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL,
  post_id       UUID        REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id    UUID        REFERENCES public.comments(id) ON DELETE CASCADE,
  message       TEXT,
  is_read       BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Type constraint
  CONSTRAINT check_notification_type CHECK (type IN ('like', 'comment', 'follow')),
  -- Prevent self-notification at DB level
  CONSTRAINT check_not_self_notify CHECK (recipient_id <> actor_id)
);

-- ============================================================
-- 2. PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id     ON public.notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read      ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at   ON public.notifications(created_at DESC);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users can view ONLY their own notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view only their own notifications'
  ) THEN
    CREATE POLICY "Users can view only their own notifications"
      ON public.notifications
      FOR SELECT
      TO authenticated
      USING (auth.uid() = recipient_id);
  END IF;
END $$;

-- UPDATE: Authenticated users can update ONLY their own notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update only their own notifications'
  ) THEN
    CREATE POLICY "Users can update only their own notifications"
      ON public.notifications
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = recipient_id)
      WITH CHECK (auth.uid() = recipient_id);
  END IF;
END $$;

-- DELETE: Authenticated users can delete ONLY their own notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can delete only their own notifications'
  ) THEN
    CREATE POLICY "Users can delete only their own notifications"
      ON public.notifications
      FOR DELETE
      TO authenticated
      USING (auth.uid() = recipient_id);
  END IF;
END $$;

-- Do NOT allow INSERT directly from frontend - handled strictly by DB trigger functions.

-- ============================================================
-- 4. TRIGGER FUNCTION FOR LIKES
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Get post author
  SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Exclude self-likes
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get actor full name
  SELECT COALESCE(full_name, 'Someone') INTO actor_name FROM public.profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (recipient_id, actor_id, type, post_id, message)
  VALUES (
    post_author_id,
    NEW.user_id,
    'like',
    NEW.post_id,
    actor_name || ' liked your photo.'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_on_like_inserted ON public.likes;
CREATE TRIGGER trigger_on_like_inserted
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_notification();

-- ============================================================
-- 5. TRIGGER FUNCTION FOR COMMENTS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Get post author
  SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Exclude self-comments
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get actor full name
  SELECT COALESCE(full_name, 'Someone') INTO actor_name FROM public.profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (recipient_id, actor_id, type, post_id, comment_id, message)
  VALUES (
    post_author_id,
    NEW.user_id,
    'comment',
    NEW.post_id,
    NEW.id,
    actor_name || ' commented on your photo.'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_on_comment_inserted ON public.comments;
CREATE TRIGGER trigger_on_comment_inserted
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_notification();

-- ============================================================
-- 6. TRIGGER FUNCTION FOR FOLLOWS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  actor_name TEXT;
BEGIN
  -- Self-follow is already prevented by constraint, but we check just in case
  IF NEW.follower_id = NEW.following_id THEN
    RETURN NEW;
  END IF;

  -- Get actor full name
  SELECT COALESCE(full_name, 'Someone') INTO actor_name FROM public.profiles WHERE id = NEW.follower_id;

  INSERT INTO public.notifications (recipient_id, actor_id, type, message)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'follow',
    actor_name || ' started following you.'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_on_follow_inserted ON public.follows;
CREATE TRIGGER trigger_on_follow_inserted
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_notification();

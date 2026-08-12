-- ============================================================
-- TripNest — Notifications Trigger Fix Patch
-- Run this entire script in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ============================================================
-- FIX 1: Grant INSERT privilege so SECURITY DEFINER triggers
--         can write notification rows (this is the most
--         likely reason rows were never appearing).
-- ============================================================
GRANT INSERT ON public.notifications TO postgres;
GRANT INSERT ON public.notifications TO service_role;

-- Also ensure sequences are usable (for gen_random_uuid())
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================
-- FIX 2: Like notification trigger — fix NULL actor_name
--         when profile row has no full_name match.
--         In PL/pgSQL, SELECT INTO does NOT assign the fallback
--         when no rows exist; we must COALESCE after the SELECT.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Get post author
  SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;

  -- Nothing to do if post not found
  IF post_author_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Exclude self-likes
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get actor full name; COALESCE after SELECT handles missing profile rows
  SELECT full_name INTO actor_name FROM public.profiles WHERE id = NEW.user_id;
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications (recipient_id, actor_id, type, post_id, message)
  VALUES (
    post_author_id,
    NEW.user_id,
    'like',
    NEW.post_id,
    actor_name || ' liked your photo.'
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never let the notification fail silently block the like action
  RAISE WARNING 'handle_like_notification error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_on_like_inserted ON public.likes;
CREATE TRIGGER trigger_on_like_inserted
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_notification();

-- ============================================================
-- FIX 3: Comment notification trigger — same actor_name fix
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Get post author
  SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;

  IF post_author_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Exclude self-comments
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get actor full name
  SELECT full_name INTO actor_name FROM public.profiles WHERE id = NEW.user_id;
  actor_name := COALESCE(actor_name, 'Someone');

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
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_comment_notification error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_on_comment_inserted ON public.comments;
CREATE TRIGGER trigger_on_comment_inserted
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_notification();

-- ============================================================
-- FIX 4: Follow notification trigger — same actor_name fix
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  actor_name TEXT;
BEGIN
  IF NEW.follower_id = NEW.following_id THEN
    RETURN NEW;
  END IF;

  -- Get actor full name
  SELECT full_name INTO actor_name FROM public.profiles WHERE id = NEW.follower_id;
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications (recipient_id, actor_id, type, message)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'follow',
    actor_name || ' started following you.'
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_follow_notification error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_on_follow_inserted ON public.follows;
CREATE TRIGGER trigger_on_follow_inserted
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_notification();

-- ============================================================
-- Done! Verify triggers exist:
-- SELECT trigger_name, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_name LIKE 'trigger_on_%_inserted';
-- ============================================================

-- Keep the immutable activity history if an authentication account is deleted.
-- Preserve audit records and stored email/details; detach only the user reference.
ALTER TABLE public.activity_log
  DROP CONSTRAINT IF EXISTS activity_log_user_id_fkey;

ALTER TABLE public.activity_log
  ADD CONSTRAINT activity_log_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

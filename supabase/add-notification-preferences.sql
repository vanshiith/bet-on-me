-- Migration to add email notification preferences
-- Run this in your Supabase SQL Editor

-- Add email notification settings to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS reminder_times TEXT[] DEFAULT ARRAY['09:00', '15:00', '20:00'];

-- Update RLS policies to allow users to update their notification preferences
-- (The existing update policy should already cover this, but we'll ensure it's correct)
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

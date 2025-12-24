-- Migration to update schema for Phase 3 & 4

-- Update users table: change bedtime from TIME to INTEGER (bedtime_hour)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bedtime'
  ) THEN
    ALTER TABLE public.users DROP COLUMN bedtime;
  END IF;
END$$;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bedtime_hour INTEGER NOT NULL DEFAULT 22;

-- Update penalties table: add habit_id and occurrence_id foreign keys
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'penalties' AND column_name = 'date'
  ) THEN
    ALTER TABLE public.penalties DROP COLUMN date;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'penalties' AND column_name = 'details'
  ) THEN
    ALTER TABLE public.penalties DROP COLUMN details;
  END IF;
END$$;

ALTER TABLE public.penalties ADD COLUMN IF NOT EXISTS habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE;
ALTER TABLE public.penalties ADD COLUMN IF NOT EXISTS occurrence_id UUID REFERENCES public.habit_occurrences(id) ON DELETE CASCADE;

-- Create policy for inserting penalties
DROP POLICY IF EXISTS "Users can insert own penalties" ON public.penalties;
CREATE POLICY "Users can insert own penalties"
  ON public.penalties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

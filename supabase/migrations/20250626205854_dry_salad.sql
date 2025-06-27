/*
  # Time Tracking System Database Schema

  1. New Tables
    - `time_entries` - Enhanced time tracking entries
    - `timer_sessions` - Active timer sessions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper data validation

  3. Indexes
    - Performance optimization for queries
*/

-- Update time_entries table structure
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_entries' AND column_name = 'task_name'
  ) THEN
    ALTER TABLE time_entries ADD COLUMN task_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_entries' AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE time_entries ADD COLUMN hourly_rate decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_entries' AND column_name = 'is_billable'
  ) THEN
    ALTER TABLE time_entries ADD COLUMN is_billable boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_entries' AND column_name = 'tags'
  ) THEN
    ALTER TABLE time_entries ADD COLUMN tags text[];
  END IF;
END $$;

-- Create timer_sessions table for active timers
CREATE TABLE IF NOT EXISTS public.timer_sessions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id uuid REFERENCES public.milestones(id) ON DELETE SET NULL,
    task_name text,
    description text,
    started_at timestamptz NOT NULL DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;

-- Timer sessions policies
CREATE POLICY "Users can view their own timer sessions"
ON public.timer_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create timer sessions"
ON public.timer_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timer sessions"
ON public.timer_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timer sessions"
ON public.timer_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_entries_user_project ON public.time_entries(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(started_at);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_user_active ON public.timer_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_project ON public.timer_sessions(project_id);

-- Add trigger for timer_sessions updated_at
CREATE TRIGGER update_timer_sessions_updated_at
    BEFORE UPDATE ON public.timer_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
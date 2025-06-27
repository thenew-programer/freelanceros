/*
  # Settings and Profile Management System

  1. New Tables
    - `user_settings` - User preferences and configuration
    - `business_settings` - Business-specific settings
    - `notification_preferences` - Granular notification controls
    - `user_sessions` - Session management for security

  2. Profile Enhancements
    - Add professional fields to profiles table
    - Add profile completeness tracking

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    - Session management capabilities

  4. Indexes
    - Performance optimization for settings queries
*/

-- Add professional fields to profiles table
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'title'
  ) THEN
    ALTER TABLE profiles ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'UTC';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_completeness'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_completeness integer DEFAULT 0;
  END IF;
END $$;

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    theme text DEFAULT 'light',
    language text DEFAULT 'en',
    date_format text DEFAULT 'MM/dd/yyyy',
    time_format text DEFAULT '12h',
    first_day_of_week integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create business_settings table
CREATE TABLE IF NOT EXISTS public.business_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    currency text DEFAULT 'USD',
    tax_rate decimal(5,2) DEFAULT 0.00,
    invoice_prefix text DEFAULT 'INV',
    invoice_number_start integer DEFAULT 1,
    payment_terms integer DEFAULT 30,
    default_hourly_rate decimal(10,2),
    business_name text,
    business_address text,
    business_phone text,
    business_email text,
    tax_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    proposal_updates boolean DEFAULT true,
    project_updates boolean DEFAULT true,
    milestone_updates boolean DEFAULT true,
    time_tracking_reminders boolean DEFAULT true,
    payment_notifications boolean DEFAULT true,
    marketing_emails boolean DEFAULT false,
    weekly_summary boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token text NOT NULL,
    ip_address inet,
    user_agent text,
    is_active boolean DEFAULT true,
    last_activity timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- User settings policies
CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Business settings policies
CREATE POLICY "Users can view their own business settings"
ON public.business_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business settings"
ON public.business_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business settings"
ON public.business_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can view their own notification preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
ON public.user_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.user_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON public.user_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_user_id ON public.business_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);

-- Add triggers for updating timestamps
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_business_settings_updated_at
    BEFORE UPDATE ON public.business_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(profile_id uuid)
RETURNS integer AS $$
DECLARE
    completeness integer := 0;
    profile_record record;
BEGIN
    SELECT * INTO profile_record FROM profiles WHERE id = profile_id;
    
    IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN
        completeness := completeness + 15;
    END IF;
    
    IF profile_record.email IS NOT NULL AND profile_record.email != '' THEN
        completeness := completeness + 15;
    END IF;
    
    IF profile_record.title IS NOT NULL AND profile_record.title != '' THEN
        completeness := completeness + 15;
    END IF;
    
    IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
        completeness := completeness + 20;
    END IF;
    
    IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN
        completeness := completeness + 10;
    END IF;
    
    IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN
        completeness := completeness + 10;
    END IF;
    
    IF profile_record.avatar_url IS NOT NULL AND profile_record.avatar_url != '' THEN
        completeness := completeness + 15;
    END IF;
    
    RETURN completeness;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile completeness automatically
CREATE OR REPLACE FUNCTION update_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completeness := calculate_profile_completeness(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile completeness
CREATE TRIGGER update_profile_completeness_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completeness();

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_default_settings()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default user settings
    INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
    
    -- Create default business settings
    INSERT INTO public.business_settings (user_id) VALUES (NEW.id);
    
    -- Create default notification preferences
    INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for default settings creation
CREATE TRIGGER create_default_settings_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_settings();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_sessions 
    WHERE expires_at < now() OR (last_activity < now() - interval '7 days');
END;
$$ LANGUAGE plpgsql;
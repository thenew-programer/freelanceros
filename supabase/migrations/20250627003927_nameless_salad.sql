/*
  # Subscription Management System Database Schema

  1. New Tables
    - `subscription_plans` - Available subscription tiers and features
    - `subscriptions` - User subscription records
    - `usage_tracking` - Resource usage monitoring
    - `billing_events` - Payment and subscription lifecycle events

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper data validation and constraints

  3. Indexes
    - Performance optimization for queries
    - Efficient usage tracking lookups
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price_monthly decimal(10,2) NOT NULL,
    price_annually decimal(10,2) NOT NULL,
    features jsonb NOT NULL,
    usage_limits jsonb NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_prices CHECK (
        price_monthly >= 0 AND 
        price_annually >= 0
    )
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
    current_period_start timestamptz NOT NULL,
    current_period_end timestamptz NOT NULL,
    cancel_at_period_end boolean DEFAULT false,
    trial_start timestamptz,
    trial_end timestamptz,
    canceled_at timestamptz,
    ended_at timestamptz,
    billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annually')),
    stripe_customer_id text,
    stripe_subscription_id text,
    payment_method_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_period CHECK (current_period_end >= current_period_start),
    CONSTRAINT valid_trial CHECK (
        (trial_start IS NULL AND trial_end IS NULL) OR
        (trial_start IS NOT NULL AND trial_end IS NOT NULL AND trial_end >= trial_start)
    )
);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resource_type text NOT NULL,
    current_usage integer NOT NULL DEFAULT 0,
    last_reset timestamptz DEFAULT now(),
    next_reset timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_usage CHECK (current_usage >= 0),
    CONSTRAINT unique_user_resource UNIQUE (user_id, resource_type)
);

-- Create billing_events table
CREATE TABLE IF NOT EXISTS public.billing_events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    event_type text NOT NULL,
    amount decimal(10,2),
    currency text DEFAULT 'USD',
    status text NOT NULL,
    stripe_event_id text,
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_amount CHECK (amount IS NULL OR amount >= 0)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- Subscription plans policies
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins can modify subscription plans"
ON public.subscription_plans FOR ALL
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only system can create subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only system can update subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view their own usage"
ON public.usage_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only system can create usage records"
ON public.usage_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only system can update usage records"
ON public.usage_tracking FOR UPDATE
USING (auth.uid() = user_id);

-- Billing events policies
CREATE POLICY "Users can view their own billing events"
ON public.billing_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only system can create billing events"
ON public.billing_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort ON public.subscription_plans(sort_order);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_ids ON public.subscriptions(stripe_customer_id, stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource ON public.usage_tracking(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_next_reset ON public.usage_tracking(next_reset);

CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON public.billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_subscription_id ON public.billing_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON public.billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_created ON public.billing_events(created_at);

-- Add triggers for updating timestamps
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON public.usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Add is_admin field to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_annually, features, usage_limits, is_active, sort_order)
VALUES 
(
    'Free', 
    'Basic freelancing tools for individuals just getting started', 
    0.00, 
    0.00, 
    '["3 clients", "5 proposals", "Basic invoicing", "Time tracking"]'::jsonb, 
    '{"clients": 3, "proposals": 5, "projects": 2, "invoices": 3, "storage_mb": 50}'::jsonb, 
    true, 
    1
),
(
    'Pro', 
    'Advanced tools for growing freelance businesses', 
    19.99, 
    199.99, 
    '["Unlimited clients", "Unlimited proposals", "Advanced invoicing", "Time tracking with analytics", "Client portal", "Custom branding"]'::jsonb, 
    '{"clients": 999999, "proposals": 999999, "projects": 50, "invoices": 999999, "storage_mb": 1024}'::jsonb, 
    true, 
    2
),
(
    'Business', 
    'Complete solution for freelance agencies and teams', 
    49.99, 
    499.99, 
    '["Everything in Pro", "Team collaboration", "Advanced analytics", "API access", "Priority support", "Custom domains"]'::jsonb, 
    '{"clients": 999999, "proposals": 999999, "projects": 999999, "invoices": 999999, "storage_mb": 10240}'::jsonb, 
    true, 
    3
);

-- Function to create free subscription for new users
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id uuid;
    current_date timestamptz := now();
    end_date timestamptz;
BEGIN
    -- Get the free plan ID
    SELECT id INTO free_plan_id FROM public.subscription_plans WHERE name = 'Free' AND price_monthly = 0;
    
    IF free_plan_id IS NULL THEN
        RAISE EXCEPTION 'Free plan not found';
    END IF;
    
    -- Set end date to 1 year from now (free plans don't expire, but we need a date)
    end_date := current_date + interval '1 year';
    
    -- Create subscription
    INSERT INTO public.subscriptions (
        user_id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        billing_cycle
    ) VALUES (
        NEW.id,
        free_plan_id,
        'active',
        current_date,
        end_date,
        'monthly'
    );
    
    -- Initialize usage tracking for common resources
    INSERT INTO public.usage_tracking (
        user_id,
        resource_type,
        current_usage,
        next_reset
    ) VALUES
    (NEW.id, 'clients', 0, end_date),
    (NEW.id, 'proposals', 0, end_date),
    (NEW.id, 'projects', 0, end_date),
    (NEW.id, 'invoices', 0, end_date),
    (NEW.id, 'storage_mb', 0, end_date);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for free subscription creation
CREATE TRIGGER create_free_subscription_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_free_subscription();

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
    user_uuid uuid,
    resource_type text,
    increment integer DEFAULT 1
) RETURNS boolean AS $$
DECLARE
    current_usage integer;
    usage_limit integer;
    subscription_record record;
BEGIN
    -- Get current usage
    SELECT ut.current_usage INTO current_usage
    FROM public.usage_tracking ut
    WHERE ut.user_id = user_uuid AND ut.resource_type = resource_type;
    
    -- Get user's subscription and plan
    SELECT s.*, sp.usage_limits
    INTO subscription_record
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = user_uuid AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- Get usage limit for this resource
    SELECT (subscription_record.usage_limits->resource_type)::integer INTO usage_limit;
    
    -- Check if adding the increment would exceed the limit
    RETURN (current_usage + increment) <= usage_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
    user_uuid uuid,
    resource_type text,
    increment integer DEFAULT 1
) RETURNS void AS $$
BEGIN
    UPDATE public.usage_tracking
    SET 
        current_usage = current_usage + increment,
        updated_at = now()
    WHERE user_id = user_uuid AND resource_type = resource_type;
END;
$$ LANGUAGE plpgsql;

-- Function to reset usage counters (to be called by a cron job)
CREATE OR REPLACE FUNCTION reset_usage_counters()
RETURNS void AS $$
BEGIN
    UPDATE public.usage_tracking
    SET 
        current_usage = 0,
        last_reset = now(),
        next_reset = now() + interval '1 month',
        updated_at = now()
    WHERE next_reset <= now();
END;
$$ LANGUAGE plpgsql;

-- Triggers to track resource usage
CREATE OR REPLACE FUNCTION track_client_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM increment_usage(NEW.user_id, 'clients', 1);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_client_usage_trigger
    AFTER INSERT ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION track_client_usage();

CREATE OR REPLACE FUNCTION track_proposal_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM increment_usage(NEW.user_id, 'proposals', 1);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_proposal_usage_trigger
    AFTER INSERT ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION track_proposal_usage();

CREATE OR REPLACE FUNCTION track_project_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM increment_usage(NEW.user_id, 'projects', 1);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_project_usage_trigger
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION track_project_usage();

CREATE OR REPLACE FUNCTION track_invoice_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM increment_usage(NEW.user_id, 'invoices', 1);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_invoice_usage_trigger
    AFTER INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION track_invoice_usage();
/*
  # Client Management System Database Schema

  1. New Tables
    - `clients` - Client information and contact details
    - `client_interactions` - Communication log and notes

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper data validation and constraints

  3. Indexes
    - Performance optimization for queries
    - Full-text search capabilities
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    company_name text NOT NULL,
    contact_name text NOT NULL,
    contact_email text NOT NULL,
    contact_phone text,
    website text,
    address text,
    city text,
    state text,
    postal_code text,
    country text DEFAULT 'United States',
    industry text,
    company_size text,
    status text DEFAULT 'potential' CHECK (status IN ('potential', 'active', 'past', 'archived')),
    source text,
    notes text,
    tags text[],
    total_project_value decimal(12,2) DEFAULT 0.00,
    project_count integer DEFAULT 0,
    last_contact_date timestamptz,
    next_follow_up_date timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_website CHECK (website IS NULL OR website ~* '^https?://.*'),
    CONSTRAINT valid_company_size CHECK (company_size IS NULL OR company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'))
);

-- Create client_interactions table
CREATE TABLE IF NOT EXISTS public.client_interactions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL CHECK (type IN ('email', 'phone', 'meeting', 'proposal', 'contract', 'note', 'follow_up')),
    subject text NOT NULL,
    description text,
    interaction_date timestamptz DEFAULT now(),
    duration_minutes integer,
    outcome text,
    follow_up_required boolean DEFAULT false,
    follow_up_date timestamptz,
    attachments text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Users can view their own clients"
ON public.clients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create clients"
ON public.clients FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
ON public.clients FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
ON public.clients FOR DELETE
USING (auth.uid() = user_id);

-- Client interactions policies
CREATE POLICY "Users can view their client interactions"
ON public.client_interactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create client interactions"
ON public.client_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their client interactions"
ON public.client_interactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their client interactions"
ON public.client_interactions FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON public.clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_contact_email ON public.clients(contact_email);
CREATE INDEX IF NOT EXISTS idx_clients_last_contact ON public.clients(last_contact_date);
CREATE INDEX IF NOT EXISTS idx_clients_next_follow_up ON public.clients(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_clients_search ON public.clients USING gin(to_tsvector('english', company_name || ' ' || contact_name || ' ' || COALESCE(contact_email, '')));

CREATE INDEX IF NOT EXISTS idx_client_interactions_client_id ON public.client_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_user_id ON public.client_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_type ON public.client_interactions(type);
CREATE INDEX IF NOT EXISTS idx_client_interactions_date ON public.client_interactions(interaction_date);
CREATE INDEX IF NOT EXISTS idx_client_interactions_follow_up ON public.client_interactions(follow_up_required, follow_up_date);

-- Add triggers for updating timestamps
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_client_interactions_updated_at
    BEFORE UPDATE ON public.client_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to update client statistics
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update project count and total value for the client
    UPDATE public.clients 
    SET 
        project_count = (
            SELECT COUNT(*) 
            FROM public.projects 
            WHERE proposal_id IN (
                SELECT id FROM public.proposals 
                WHERE client_email = clients.contact_email 
                AND user_id = clients.user_id
            )
        ),
        total_project_value = COALESCE((
            SELECT SUM(amount) 
            FROM public.proposals 
            WHERE client_email = clients.contact_email 
            AND user_id = clients.user_id
            AND status = 'approved'
        ), 0.00)
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create clients from proposals
CREATE OR REPLACE FUNCTION auto_create_client_from_proposal()
RETURNS TRIGGER AS $$
DECLARE
    existing_client_id uuid;
BEGIN
    -- Check if client already exists
    SELECT id INTO existing_client_id
    FROM public.clients
    WHERE user_id = NEW.user_id 
    AND contact_email = NEW.client_email;
    
    -- If client doesn't exist, create one
    IF existing_client_id IS NULL THEN
        INSERT INTO public.clients (
            user_id,
            company_name,
            contact_name,
            contact_email,
            status,
            source,
            last_contact_date
        ) VALUES (
            NEW.user_id,
            NEW.client_name,
            NEW.client_name,
            NEW.client_email,
            'potential',
            'proposal',
            NEW.created_at
        );
    ELSE
        -- Update last contact date
        UPDATE public.clients
        SET last_contact_date = NEW.created_at
        WHERE id = existing_client_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-creating clients from proposals
CREATE TRIGGER auto_create_client_from_proposal_trigger
    AFTER INSERT ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_client_from_proposal();

-- Function to update last contact date when interactions are added
CREATE OR REPLACE FUNCTION update_last_contact_date()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.clients
    SET last_contact_date = NEW.interaction_date
    WHERE id = NEW.client_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating last contact date
CREATE TRIGGER update_last_contact_date_trigger
    AFTER INSERT ON public.client_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_last_contact_date();

-- Add client_id to proposals table for better relationship tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE proposals ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON public.proposals(client_id);
  END IF;
END $$;

-- Add client_id to projects table for better relationship tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
  END IF;
END $$;
/*
  # Invoice Management System Database Schema

  1. New Tables
    - `invoices` - Main invoice records
    - `invoice_items` - Line items for invoices
    - `invoice_payments` - Payment tracking
    - `invoice_templates` - Customizable invoice templates

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper data validation and constraints

  3. Indexes
    - Performance optimization for queries
    - Full-text search capabilities
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
    invoice_number text NOT NULL,
    title text NOT NULL,
    description text,
    issue_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date NOT NULL,
    currency text DEFAULT 'USD',
    subtotal decimal(12,2) NOT NULL DEFAULT 0.00,
    tax_rate decimal(5,2) DEFAULT 0.00,
    tax_amount decimal(12,2) NOT NULL DEFAULT 0.00,
    discount_amount decimal(12,2) DEFAULT 0.00,
    total_amount decimal(12,2) NOT NULL DEFAULT 0.00,
    paid_amount decimal(12,2) NOT NULL DEFAULT 0.00,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled')),
    payment_terms integer DEFAULT 30,
    notes text,
    footer_text text,
    client_name text,
    client_email text,
    client_address text,
    billing_address text,
    template_id uuid,
    sent_at timestamptz,
    viewed_at timestamptz,
    paid_at timestamptz,
    reminder_count integer DEFAULT 0,
    last_reminder_sent timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_amounts CHECK (
        subtotal >= 0 AND 
        tax_amount >= 0 AND 
        discount_amount >= 0 AND 
        total_amount >= 0 AND 
        paid_amount >= 0 AND
        paid_amount <= total_amount
    ),
    CONSTRAINT valid_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),
    CONSTRAINT valid_dates CHECK (due_date >= issue_date),
    CONSTRAINT unique_invoice_number UNIQUE (user_id, invoice_number)
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    time_entry_id uuid REFERENCES public.time_entries(id) ON DELETE SET NULL,
    milestone_id uuid REFERENCES public.milestones(id) ON DELETE SET NULL,
    description text NOT NULL,
    quantity decimal(10,2) NOT NULL DEFAULT 1.00,
    unit_price decimal(10,2) NOT NULL DEFAULT 0.00,
    total_price decimal(12,2) NOT NULL DEFAULT 0.00,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_item_amounts CHECK (
        quantity > 0 AND 
        unit_price >= 0 AND 
        total_price >= 0
    )
);

-- Create invoice_payments table
CREATE TABLE IF NOT EXISTS public.invoice_payments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    amount decimal(12,2) NOT NULL,
    payment_date date NOT NULL DEFAULT CURRENT_DATE,
    payment_method text,
    transaction_id text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_payment_amount CHECK (amount > 0)
);

-- Create invoice_templates table
CREATE TABLE IF NOT EXISTS public.invoice_templates (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    is_default boolean DEFAULT false,
    header_html text,
    footer_html text,
    css_styles text,
    logo_url text,
    color_scheme jsonb DEFAULT '{"primary": "#000000", "secondary": "#666666", "accent": "#0066cc"}',
    font_family text DEFAULT 'Inter',
    layout_settings jsonb DEFAULT '{"showLogo": true, "showAddress": true, "showNotes": true}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

-- Invoices policies
CREATE POLICY "Users can view their own invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create invoices"
ON public.invoices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
ON public.invoices FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
ON public.invoices FOR DELETE
USING (auth.uid() = user_id);

-- Invoice items policies
CREATE POLICY "Users can view their invoice items"
ON public.invoice_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create invoice items"
ON public.invoice_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_id
        AND invoices.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their invoice items"
ON public.invoice_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_id
        AND invoices.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their invoice items"
ON public.invoice_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_id
        AND invoices.user_id = auth.uid()
    )
);

-- Invoice payments policies
CREATE POLICY "Users can view their invoice payments"
ON public.invoice_payments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create invoice payments"
ON public.invoice_payments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_id
        AND invoices.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their invoice payments"
ON public.invoice_payments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_id
        AND invoices.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their invoice payments"
ON public.invoice_payments FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_id
        AND invoices.user_id = auth.uid()
    )
);

-- Invoice templates policies
CREATE POLICY "Users can view their own templates"
ON public.invoice_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create templates"
ON public.invoice_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.invoice_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.invoice_templates FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON public.invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(user_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_search ON public.invoices USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(client_name, '')));

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_time_entry_id ON public.invoice_items(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_milestone_id ON public.invoice_items(milestone_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_sort_order ON public.invoice_items(invoice_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON public.invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_date ON public.invoice_payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_invoice_templates_user_id ON public.invoice_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_default ON public.invoice_templates(user_id, is_default);

-- Add triggers for updating timestamps
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoice_items_updated_at
    BEFORE UPDATE ON public.invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoice_payments_updated_at
    BEFORE UPDATE ON public.invoice_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoice_templates_updated_at
    BEFORE UPDATE ON public.invoice_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate subtotal from items
    UPDATE public.invoices 
    SET 
        subtotal = COALESCE((
            SELECT SUM(total_price) 
            FROM public.invoice_items 
            WHERE invoice_id = NEW.invoice_id
        ), 0.00),
        updated_at = now()
    WHERE id = NEW.invoice_id;
    
    -- Calculate tax amount and total
    UPDATE public.invoices 
    SET 
        tax_amount = ROUND((subtotal - COALESCE(discount_amount, 0)) * (tax_rate / 100), 2),
        updated_at = now()
    WHERE id = NEW.invoice_id;
    
    UPDATE public.invoices 
    SET 
        total_amount = subtotal + tax_amount - COALESCE(discount_amount, 0),
        updated_at = now()
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic total calculation
CREATE TRIGGER calculate_invoice_totals_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_invoice_totals();

-- Function to update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
DECLARE
    invoice_record record;
    total_paid decimal(12,2);
BEGIN
    -- Get invoice details
    SELECT * INTO invoice_record FROM public.invoices WHERE id = NEW.invoice_id;
    
    -- Calculate total paid amount
    SELECT COALESCE(SUM(amount), 0) INTO total_paid 
    FROM public.invoice_payments 
    WHERE invoice_id = NEW.invoice_id;
    
    -- Update paid amount
    UPDATE public.invoices 
    SET 
        paid_amount = total_paid,
        updated_at = now()
    WHERE id = NEW.invoice_id;
    
    -- Update status based on payment
    IF total_paid >= invoice_record.total_amount THEN
        UPDATE public.invoices 
        SET 
            status = 'paid',
            paid_at = CASE WHEN paid_at IS NULL THEN now() ELSE paid_at END,
            updated_at = now()
        WHERE id = NEW.invoice_id;
    ELSIF total_paid > 0 THEN
        UPDATE public.invoices 
        SET 
            status = 'partial',
            updated_at = now()
        WHERE id = NEW.invoice_id AND status NOT IN ('paid');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment status updates
CREATE TRIGGER update_invoice_status_on_payment
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_status();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number(user_uuid uuid)
RETURNS text AS $$
DECLARE
    business_settings record;
    next_number integer;
    invoice_number text;
BEGIN
    -- Get business settings
    SELECT * INTO business_settings 
    FROM public.business_settings 
    WHERE user_id = user_uuid;
    
    -- Get next invoice number
    SELECT COALESCE(MAX(CAST(SUBSTRING(i.invoice_number FROM '[0-9]+$') AS integer)), 0) + 1
    INTO next_number
    FROM public.invoices i
    WHERE i.user_id = user_uuid 
    AND i.invoice_number ~ '^[A-Z]*[0-9]+$';
    
    -- Use starting number from settings if this is the first invoice
    IF next_number = 1 AND business_settings.invoice_number_start > 1 THEN
        next_number = business_settings.invoice_number_start;
    END IF;
    
    -- Generate invoice number
    invoice_number = COALESCE(business_settings.invoice_prefix, 'INV') || LPAD(next_number::text, 4, '0');
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to check overdue invoices
CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS void AS $$
BEGIN
    UPDATE public.invoices 
    SET 
        status = 'overdue',
        updated_at = now()
    WHERE 
        status IN ('sent', 'viewed', 'partial') 
        AND due_date < CURRENT_DATE
        AND total_amount > paid_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to create default invoice template for new users
CREATE OR REPLACE FUNCTION create_default_invoice_template()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.invoice_templates (
        user_id,
        name,
        is_default,
        header_html,
        footer_html,
        css_styles,
        color_scheme,
        font_family,
        layout_settings
    ) VALUES (
        NEW.id,
        'Default Template',
        true,
        '<div class="header"><h1>INVOICE</h1></div>',
        '<div class="footer"><p>Thank you for your business!</p></div>',
        '.header { text-align: center; margin-bottom: 2rem; } .footer { text-align: center; margin-top: 2rem; color: #666; }',
        '{"primary": "#000000", "secondary": "#666666", "accent": "#0066cc"}',
        'Inter',
        '{"showLogo": true, "showAddress": true, "showNotes": true}'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for default template creation
CREATE TRIGGER create_default_invoice_template_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_invoice_template();
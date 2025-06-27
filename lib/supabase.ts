import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  title: string | null;
  bio: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  timezone: string | null;
  avatar_url: string | null;
  profile_completeness: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  date_format: string;
  time_format: string;
  first_day_of_week: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  id: string;
  user_id: string;
  currency: string;
  tax_rate: number;
  invoice_prefix: string;
  invoice_number_start: number;
  payment_terms: number;
  default_hourly_rate: number | null;
  business_name: string | null;
  business_address: string | null;
  business_phone: string | null;
  business_email: string | null;
  tax_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  proposal_updates: boolean;
  project_updates: boolean;
  milestone_updates: boolean;
  time_tracking_reminders: boolean;
  payment_notifications: boolean;
  marketing_emails: boolean;
  weekly_summary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  industry: string | null;
  company_size: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  tags: string[] | null;
  total_project_value?: number;
  project_count?: number;
  last_contact_date?: string | null;
  next_follow_up_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientInteraction {
  id: string;
  client_id: string;
  user_id: string;
  type: string;
  subject: string;
  description: string | null;
  interaction_date: string;
  duration_minutes: number | null;
  outcome: string | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  client_name: string;
  client_email: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  proposal_id: string | null;
  user_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  status: string;
  client_portal_id: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  milestone_id: string | null;
  task_name: string | null;
  description: string | null;
  duration: string;
  started_at: string;
  hourly_rate: number | null;
  is_billable: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  project?: Project;
  milestone?: Milestone;
}

export interface TimerSession {
  id: string;
  user_id: string;
  project_id: string;
  milestone_id: string | null;
  task_name: string | null;
  description: string | null;
  started_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  project?: {
    id?: string;
    title: string;
  };
  milestone?: {
    id?: string;
    title: string;
  };
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  invoice_number: string;
  title: string;
  description: string | null;
  issue_date: string;
  due_date: string;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: string;
  payment_terms: number;
  notes: string | null;
  footer_text: string | null;
  client_name: string | null;
  client_email: string | null;
  client_address: string | null;
  billing_address: string | null;
  template_id: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  paid_at: string | null;
  reminder_count: number;
  last_reminder_sent: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  time_entry_id: string | null;
  milestone_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceTemplate {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  header_html: string | null;
  footer_html: string | null;
  css_styles: string | null;
  logo_url: string | null;
  color_scheme: Record<string, string>;
  font_family: string;
  layout_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_annually: number;
  features: string[];
  usage_limits: Record<string, number>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  ended_at: string | null;
  billing_cycle: 'monthly' | 'annually';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  payment_method_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  resource_type: string;
  current_usage: number;
  last_reset: string;
  next_reset: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingEvent {
  id: string;
  user_id: string;
  subscription_id: string | null;
  event_type: string;
  amount: number | null;
  currency: string;
  status: string;
  stripe_event_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}
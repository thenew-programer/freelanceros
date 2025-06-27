import { supabase } from './supabase';
import type { SubscriptionPlan, Subscription, UsageTracking, BillingEvent } from './supabase';

// Subscription Plans
export async function getSubscriptionPlans() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return { data, error };
}

export async function getSubscriptionPlanById(planId: string) {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  return { data, error };
}

// User Subscriptions
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return { data, error };
}

export async function createSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([subscription])
    .select()
    .single();

  return { data, error };
}

export async function updateSubscription(id: string, updates: Partial<Subscription>) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function cancelSubscription(id: string, cancelImmediately: boolean = false) {
  const updates = cancelImmediately
    ? { status: 'canceled', canceled_at: new Date().toISOString(), ended_at: new Date().toISOString() }
    : { cancel_at_period_end: true, canceled_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

// Usage Tracking
export async function getUserUsage(userId: string) {
  const { data, error } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId);

  return { data, error };
}

export async function getResourceUsage(userId: string, resourceType: string) {
  const { data, error } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .single();

  return { data, error };
}

export async function incrementUsage(userId: string, resourceType: string, increment: number = 1) {
  // First check if we can increment
  const { data: canIncrement } = await supabase.rpc('check_usage_limit', {
    user_uuid: userId,
    resource_type: resourceType,
    increment: increment
  });

  if (!canIncrement) {
    return { data: null, error: new Error('Usage limit exceeded') };
  }

  // Then increment
  const { error } = await supabase.rpc('increment_usage', {
    user_uuid: userId,
    resource_type: resourceType,
    increment: increment
  });

  return { data: !error, error };
}

// Billing Events
export async function getBillingEvents(userId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from('billing_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

export async function createBillingEvent(event: Omit<BillingEvent, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('billing_events')
    .insert([event])
    .select()
    .single();

  return { data, error };
}

// Subscription Management
export async function checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
  try {
    // Get user's active subscription
    const { data: subscription, error } = await getUserSubscription(userId);
    
    if (error || !subscription || !['active', 'trialing'].includes(subscription.status)) {
      return false;
    }
    
    // Check if the feature is included in the plan
    const features = subscription.plan?.features || [];
    return features.some((f: string) => f.toLowerCase().includes(feature.toLowerCase()));
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

export async function checkResourceLimit(userId: string, resourceType: string, increment: number = 1): Promise<boolean> {
  try {
    const { data: canIncrement } = await supabase.rpc('check_usage_limit', {
      user_uuid: userId,
      resource_type: resourceType,
      increment: increment
    });
    
    return !!canIncrement;
  } catch (error) {
    console.error('Error checking resource limit:', error);
    return false;
  }
}

// Stripe Helpers
export async function createStripeCheckoutSession(userId: string, planId: string, billingCycle: 'monthly' | 'annually') {
  const response = await fetch('/api/subscriptions/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      planId,
      billingCycle,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return await response.json();
}

export async function createStripePortalSession(userId: string) {
  const response = await fetch('/api/subscriptions/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create portal session');
  }

  return await response.json();
}
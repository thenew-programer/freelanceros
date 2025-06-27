import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { getSubscriptionPlanById, createBillingEvent, updateSubscription } from '@/lib/subscriptions';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session, event);
        break;
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription, event);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription, event);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, event);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice, event);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice, event);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    return NextResponse.json(
      { message: `Error processing webhook: ${error.message}` },
      { status: 500 }
    );
  }
}

// Handler functions
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, event: Stripe.Event) {
  if (!session.metadata?.userId || !session.metadata?.planId || !session.metadata?.billingCycle) {
    throw new Error('Missing metadata in checkout session');
  }

  const userId = session.metadata.userId;
  const planId = session.metadata.planId;
  const billingCycle = session.metadata.billingCycle as 'monthly' | 'annually';
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Create billing event
  await createBillingEvent({
    user_id: userId,
    subscription_id: null, // Will be updated later
    event_type: 'subscription_created',
    amount: session.amount_total ? session.amount_total / 100 : null,
    currency: session.currency || 'usd',
    status: 'succeeded',
    stripe_event_id: event.id,
    metadata: session.metadata,
  });

  // We'll let the subscription.created webhook handle the actual subscription creation
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, event: Stripe.Event) {
  // Get customer metadata to find our user
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  // Check if customer is deleted
  if (customer.deleted) {
    throw new Error('Cannot process subscription for deleted customer');
  }
  
  const userId = customer.metadata.userId;

  if (!userId) {
    throw new Error('User ID not found in customer metadata');
  }

  // Get plan ID from metadata or product
  let planId: string;
  if (subscription.metadata.planId) {
    planId = subscription.metadata.planId;
  } else {
    // Try to find plan by name
    const item = subscription.items.data[0];
    const product = await stripe.products.retrieve(item.price.product as string);
    
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('id, name')
      .eq('is_active', true);
    
    const plan = plans?.find(p => p.name === product.name.split(' ')[0]);
    if (!plan) {
      throw new Error('Could not determine plan ID');
    }
    
    planId = plan.id;
  }

  // Determine billing cycle
  const billingCycle = subscription.items.data[0].price.recurring?.interval === 'year' 
    ? 'annually' 
    : 'monthly';

  // Create or update subscription in our database
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (existingSubscription) {
    // Update existing subscription
    await updateSubscription(existingSubscription.id, {
      plan_id: planId,
      status: subscription.status as any,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      billing_cycle: billingCycle,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
    });
  } else {
    // Create new subscription
    const { data: newSubscription, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: userId,
        plan_id: planId,
        status: subscription.status as any,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        billing_cycle: billingCycle,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    // Update billing event with subscription ID
    await supabase
      .from('billing_events')
      .update({ subscription_id: newSubscription.id })
      .eq('user_id', userId)
      .eq('event_type', 'subscription_created')
      .is('subscription_id', null);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, event: Stripe.Event) {
  // Find our subscription by Stripe subscription ID
  const { data: existingSubscription, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (error || !existingSubscription) {
    throw new Error(`Subscription not found: ${subscription.id}`);
  }

  // Determine if plan changed
  let planId = existingSubscription.plan_id;
  const item = subscription.items.data[0];
  
  // If price changed, try to find the corresponding plan
  if (item.price.id !== subscription.metadata.priceId) {
    const product = await stripe.products.retrieve(item.price.product as string);
    
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('id, name')
      .eq('is_active', true);
    
    const plan = plans?.find(p => p.name === product.name.split(' ')[0]);
    if (plan) {
      planId = plan.id;
    }
  }

  // Determine billing cycle
  const billingCycle = item.price.recurring?.interval === 'year' 
    ? 'annually' 
    : 'monthly';

  // Update subscription
  await updateSubscription(existingSubscription.id, {
    plan_id: planId,
    status: subscription.status as any,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    billing_cycle: billingCycle,
  });

  // Create billing event
  await createBillingEvent({
    user_id: existingSubscription.user_id,
    subscription_id: existingSubscription.id,
    event_type: 'subscription_updated',
    status: 'succeeded',
    currency: 'usd',
    amount: null,
    stripe_event_id: event.id,
    metadata: {
      stripe_subscription_id: subscription.id,
      status: subscription.status,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, event: Stripe.Event) {
  // Find our subscription by Stripe subscription ID
  const { data: existingSubscription, error } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (error || !existingSubscription) {
    throw new Error(`Subscription not found: ${subscription.id}`);
  }

  // Update subscription
  await updateSubscription(existingSubscription.id, {
    status: 'canceled',
    canceled_at: new Date().toISOString(),
    ended_at: new Date().toISOString(),
  });

  // Create billing event
  await createBillingEvent({
    user_id: existingSubscription.user_id,
    subscription_id: existingSubscription.id,
    event_type: 'subscription_canceled',
    status: 'succeeded',
    currency: 'usd',
    amount: null,
    stripe_event_id: event.id,
    metadata: {
      stripe_subscription_id: subscription.id,
    },
  });

  // Create a free subscription for the user
  const { data: freePlan } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('name', 'Free')
    .eq('price_monthly', 0)
    .single();

  if (freePlan) {
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    await supabase
      .from('subscriptions')
      .insert([{
        user_id: existingSubscription.user_id,
        plan_id: freePlan.id,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: endDate.toISOString(),
        billing_cycle: 'monthly',
      }]);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice, event: Stripe.Event) {
  // Find subscription by Stripe subscription ID
  if (!invoice.subscription) return;

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (error || !subscription) {
    throw new Error(`Subscription not found: ${invoice.subscription}`);
  }

  // Create billing event
  await createBillingEvent({
    user_id: subscription.user_id,
    subscription_id: subscription.id,
    event_type: 'invoice_paid',
    amount: invoice.amount_paid ? invoice.amount_paid / 100 : null,
    currency: invoice.currency,
    status: 'succeeded',
    stripe_event_id: event.id,
    metadata: {
      invoice_number: invoice.number,
      invoice_url: invoice.hosted_invoice_url,
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, event: Stripe.Event) {
  // Find subscription by Stripe subscription ID
  if (!invoice.subscription) return;

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (error || !subscription) {
    throw new Error(`Subscription not found: ${invoice.subscription}`);
  }

  // Update subscription status
  await updateSubscription(subscription.id, {
    status: 'past_due',
  });

  // Create billing event
  await createBillingEvent({
    user_id: subscription.user_id,
    subscription_id: subscription.id,
    event_type: 'invoice_payment_failed',
    amount: invoice.amount_due ? invoice.amount_due / 100 : null,
    currency: invoice.currency,
    status: 'failed',
    stripe_event_id: event.id,
    metadata: {
      invoice_number: invoice.number,
      invoice_url: invoice.hosted_invoice_url,
    },
  });
}
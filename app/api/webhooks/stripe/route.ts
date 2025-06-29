import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { createBillingEvent, updateSubscription } from '@/lib/subscriptions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
	const payload = await request.text();
	const sig = request.headers.get('stripe-signature') as string;

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
		console.log(`✅ Webhook received: ${event.type} (${event.id})`);
	} catch (err: any) {
		console.error(`❌ Webhook signature verification failed: ${err.message}`);
		return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
	}

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				console.log('🛒 Processing checkout.session.completed');
				const session = event.data.object as Stripe.Checkout.Session;
				console.log('Session data:', {
					id: session.id,
					customer: session.customer,
					subscription: session.subscription,
					metadata: session.metadata,
					amount_total: session.amount_total,
					currency: session.currency,
					payment_status: session.payment_status
				});
				await handleCheckoutSessionCompleted(session, event);
				break;
			}
			case 'customer.subscription.created': {
				console.log('📅 Processing customer.subscription.created');
				const subscription = event.data.object as Stripe.Subscription;
				console.log('Subscription data:', {
					id: subscription.id,
					customer: subscription.customer,
					status: subscription.status,
					items: subscription.items.data.map(item => ({
						price_id: item.price.id,
						product: item.price.product,
						interval: item.price.recurring?.interval
					})),
					metadata: subscription.metadata
				});
				await handleSubscriptionCreated(subscription, event);
				break;
			}
			case 'customer.subscription.updated': {
				console.log('🔄 Processing customer.subscription.updated');
				const subscription = event.data.object as Stripe.Subscription;
				await handleSubscriptionUpdated(subscription, event);
				break;
			}
			case 'customer.subscription.deleted': {
				console.log('❌ Processing customer.subscription.deleted');
				const subscription = event.data.object as Stripe.Subscription;
				await handleSubscriptionDeleted(subscription, event);
				break;
			}
			case 'invoice.paid': {
				console.log('💰 Processing invoice.paid');
				const invoice = event.data.object as Stripe.Invoice;
				await handleInvoicePaid(invoice, event);
				break;
			}
			case 'invoice.payment_failed': {
				console.log('💸 Processing invoice.payment_failed');
				const invoice = event.data.object as Stripe.Invoice;
				await handleInvoicePaymentFailed(invoice, event);
				break;
			}
			default:
				console.log(`ℹ️ Unhandled event type: ${event.type}`);
		}

		console.log(`✅ Successfully processed webhook: ${event.type}`);
		return NextResponse.json({ received: true });
	} catch (error: any) {
		console.error(`❌ Error processing webhook ${event.type}:`, error);
		return NextResponse.json(
			{ message: `Error processing webhook: ${error.message}` },
			{ status: 500 }
		);
	}
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, event: Stripe.Event) {
	console.log('🔍 Checking session metadata...');

	if (!session.metadata?.userId || !session.metadata?.planId || !session.metadata?.billingCycle) {
		console.error('❌ Missing required metadata:', {
			userId: session.metadata?.userId,
			planId: session.metadata?.planId,
			billingCycle: session.metadata?.billingCycle,
			allMetadata: session.metadata
		});
		throw new Error('Missing metadata in checkout session');
	}

	const userId = session.metadata.userId;
	const planId = session.metadata.planId;
	const billingCycle = session.metadata.billingCycle as 'monthly' | 'annually';
	const customerId = session.customer as string;
	const subscriptionId = session.subscription as string;

	console.log('📝 Creating billing event for checkout completion...');

	try {
		await createBillingEvent({
			user_id: userId,
			subscription_id: subscriptionId,
			event_type: 'subscription_created',
			amount: session.amount_total ? session.amount_total / 100 : null,
			currency: session.currency || 'usd',
			status: 'succeeded',
			stripe_event_id: event.id,
			metadata: session.metadata,
		});
		console.log('✅ Billing event created successfully');
	} catch (error) {
		console.error('❌ Failed to create billing event:', error);
		throw error;
	}
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, event: Stripe.Event) {
	console.log('🔍 Retrieving customer...');

	const customer = await stripe.customers.retrieve(subscription.customer as string);

	if (customer.deleted) {
		console.error('❌ Customer is deleted');
		throw new Error('Cannot process subscription for deleted customer');
	}

	console.log('Customer metadata:', customer.metadata);
	const userId = customer.metadata.userId;

	if (!userId) {
		console.error('❌ User ID not found in customer metadata');
		throw new Error('User ID not found in customer metadata');
	}

	console.log('🔍 Determining plan ID...');
	let planId: string;

	if (subscription.metadata.planId) {
		planId = subscription.metadata.planId;
		console.log('✅ Plan ID from subscription metadata:', planId);
	} else {
		console.log('⚠️ No plan ID in subscription metadata, deriving from product...');
		const item = subscription.items.data[0];
		const product = await stripe.products.retrieve(item.price.product as string);

		console.log('Product details:', {
			id: product.id,
			name: product.name,
			metadata: product.metadata
		});

		const { data: plans, error: plansError } = await supabase
			.from('subscription_plans')
			.select('id, name')
			.eq('is_active', true);

		if (plansError) {
			console.error('❌ Error fetching plans:', plansError);
			throw plansError;
		}

		console.log('Available plans:', plans);

		const plan = plans?.find(p => p.name === product.name.split(' ')[0]);
		if (!plan) {
			console.error('❌ Could not find matching plan for product:', product.name);
			throw new Error('Could not determine plan ID');
		}

		planId = plan.id;
		console.log('✅ Derived plan ID:', planId);
	}

	const billingCycle = subscription.items.data[0].price.recurring?.interval === 'year'
		? 'annually'
		: 'monthly';

	console.log('🔍 Checking for existing subscription...');
	const { data: existingSubscription, error: existingError } = await supabase
		.from('subscriptions')
		.select('id')
		.eq('user_id', userId)
		.eq('stripe_subscription_id', subscription.id)
		.single();

	if (existingError && existingError.code !== 'PGRST116') {
		console.error('❌ Error checking existing subscription:', existingError);
		throw existingError;
	}

	if (existingSubscription) {
		console.log('🔄 Updating existing subscription...');
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
		console.log('✅ Existing subscription updated');
	} else {
		console.log('➕ Creating new subscription...');

		// First, cancel any existing active subscriptions for this user
		const { data: activeSubscriptions } = await supabase
			.from('subscriptions')
			.select('id')
			.eq('user_id', userId)
			.eq('status', 'active');

		if (activeSubscriptions && activeSubscriptions.length > 0) {
			console.log(`🔄 Found ${activeSubscriptions.length} active subscriptions to cancel`);
			for (const sub of activeSubscriptions) {
				await updateSubscription(sub.id, {
					status: 'canceled',
					canceled_at: new Date().toISOString(),
					ended_at: new Date().toISOString(),
				});
			}
		}

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
			console.error('❌ Failed to create subscription:', error);
			throw new Error(`Failed to create subscription: ${error.message}`);
		}

		console.log('✅ New subscription created:', newSubscription);

		// Update billing events with the new subscription ID
		console.log('🔄 Updating billing events...');
		const { error: updateError } = await supabase
			.from('billing_events')
			.update({ subscription_id: newSubscription.id })
			.eq('user_id', userId)
			.eq('event_type', 'subscription_created')
			.is('subscription_id', null);

		if (updateError) {
			console.error('❌ Failed to update billing events:', updateError);
		} else {
			console.log('✅ Billing events updated');
		}
	}
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, event: Stripe.Event) {
	const { data: existingSubscription, error } = await supabase
		.from('subscriptions')
		.select('id, user_id, plan_id')
		.eq('stripe_subscription_id', subscription.id)
		.single();

	if (error || !existingSubscription) {
		throw new Error(`Subscription not found: ${subscription.id}`);
	}

	let planId = existingSubscription.plan_id;
	const item = subscription.items.data[0];

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

	const billingCycle = item.price.recurring?.interval === 'year'
		? 'annually'
		: 'monthly';

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
	const { data: existingSubscription, error } = await supabase
		.from('subscriptions')
		.select('id, user_id')
		.eq('stripe_subscription_id', subscription.id)
		.single();

	if (error || !existingSubscription) {
		throw new Error(`Subscription not found: ${subscription.id}`);
	}

	await updateSubscription(existingSubscription.id, {
		status: 'canceled',
		canceled_at: new Date().toISOString(),
		ended_at: new Date().toISOString(),
	});

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
	if (!invoice.subscription) return;

	const { data: subscription, error } = await supabase
		.from('subscriptions')
		.select('id, user_id')
		.eq('stripe_subscription_id', invoice.subscription)
		.single();

	if (error || !subscription) {
		throw new Error(`Subscription not found: ${invoice.subscription}`);
	}

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
	if (!invoice.subscription) return;

	const { data: subscription, error } = await supabase
		.from('subscriptions')
		.select('id, user_id')
		.eq('stripe_subscription_id', invoice.subscription)
		.single();

	if (error || !subscription) {
		throw new Error(`Subscription not found: ${invoice.subscription}`);
	}

	await updateSubscription(subscription.id, {
		status: 'past_due',
	});

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

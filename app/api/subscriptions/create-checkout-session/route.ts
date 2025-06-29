import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { getSubscriptionPlanById } from '@/lib/subscriptions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
	try {
		const supabase = createRouteHandlerClient({ cookies });
		const { userId, planId, billingCycle } = await request.json();

		if (!userId || !planId || !billingCycle) {
			return NextResponse.json(
				{ message: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const { data: userData, error: userError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single();

		if (userError || !userData) {
			return NextResponse.json(
				{ message: 'User not found' },
				{ status: 404 }
			);
		}

		const { data: plan, error: planError } = await getSubscriptionPlanById(planId);

		if (planError || !plan) {
			return NextResponse.json(
				{ message: 'Subscription plan not found' },
				{ status: 404 }
			);
		}

		const { data: subscription } = await supabase
			.from('subscriptions')
			.select('stripe_customer_id')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.limit(1)
			.single();

		let customerId = subscription?.stripe_customer_id;

		if (!customerId) {
			const customer = await stripe.customers.create({
				email: userData.email,
				name: userData.full_name || undefined,
				metadata: {
					userId,
				},
			});
			customerId = customer.id;
		}

		const unitAmount = billingCycle === 'annually'
			? Math.round(plan.price_annually * 100)
			: Math.round(plan.price_monthly * 100);

		const session = await stripe.checkout.sessions.create({
			customer: customerId,
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: `${plan.name} Plan (${billingCycle === 'annually' ? 'Annual' : 'Monthly'})`,
							description: plan.description || undefined,
						},
						unit_amount: unitAmount,
						recurring: {
							interval: billingCycle === 'annually' ? 'year' : 'month',
						},
					},
					quantity: 1,
				},
			],
			mode: 'subscription',
			success_url: `${request.headers.get('origin')}/settings/billing?success=true`,
			cancel_url: `${request.headers.get('origin')}/settings/billing?canceled=true`,
			metadata: {
				userId,
				planId,
				billingCycle,
			},
		});

		return NextResponse.json({ url: session.url });
	} catch (error: any) {
		console.error('Error creating checkout session:', error);
		return NextResponse.json(
			{ message: error.message || 'Internal server error' },
			{ status: 500 }
		);
	}
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
	try {
		const supabase = createRouteHandlerClient({ cookies });
		const { userId } = await request.json();

		if (!userId) {
			return NextResponse.json(
				{ message: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const { data: subscription, error } = await supabase
			.from('subscriptions')
			.select('stripe_customer_id')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.limit(1)
			.single();

		if (error || !subscription?.stripe_customer_id) {
			return NextResponse.json(
				{ message: 'No active subscription found' },
				{ status: 404 }
			);
		}

		const session = await stripe.billingPortal.sessions.create({
			customer: subscription.stripe_customer_id,
			return_url: `${request.headers.get('origin')}/settings/billing`,
		});

		return NextResponse.json({ url: session.url });
	} catch (error: any) {
		console.error('Error creating portal session:', error);
		return NextResponse.json(
			{ message: error.message || 'Internal server error' },
			{ status: 500 }
		);
	}
}

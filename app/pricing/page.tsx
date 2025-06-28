'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, Zap, Star, BriefcaseBusiness, Shield, ArrowRight, CheckCircle, Globe, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { getSubscriptionPlans, createStripeCheckoutSession, getUserSubscription } from '@/lib/subscriptions';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';
import type { SubscriptionPlan } from '@/lib/supabase';

export default function PricingPage() {
	const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
	const [currentPlan, setCurrentPlan] = useState<string | null>(null);
	const [isAnnual, setIsAnnual] = useState(false);
	const [loading, setLoading] = useState(true);
	const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		loadPlans();
	}, []);

	const loadPlans = async () => {
		try {
			// Load subscription plans
			const { data: plansData, error: plansError } = await getSubscriptionPlans();

			if (plansError) {
				toast.error('Failed to load subscription plans');
				return;
			}

			setPlans(plansData || []);

			// Get current user's subscription
			const { user } = await getCurrentUser();
			if (user) {
				const { data: subscription } = await getUserSubscription(user.id);
				if (subscription) {
					setCurrentPlan(subscription.plan_id);
					setIsAnnual(subscription.billing_cycle === 'annually');
				}
			}
		} catch (error) {
			toast.error('Failed to load subscription data');
		} finally {
			setLoading(false);
		}
	};

	const handleCheckout = async (planId: string) => {
		try {
			setCheckoutLoading(planId);

			const { user } = await getCurrentUser();
			if (!user) {
				router.push('/auth/signin?redirect=/pricing');
				return;
			}

			// Create checkout session
			const { url } = await createStripeCheckoutSession(
				user.id,
				planId,
				isAnnual ? 'annually' : 'monthly'
			);

			// Redirect to checkout
			window.location.href = url;
		} catch (error: any) {
			toast.error(error.message || 'Failed to create checkout session');
		} finally {
			setCheckoutLoading(null);
		}
	};

	const getButtonText = (plan: SubscriptionPlan) => {
		if (plan.id === currentPlan) {
			return 'Current Plan';
		}

		if (plan.price_monthly === 0) {
			return 'Free Plan';
		}

		return 'Subscribe';
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<nav className="container mx-auto px-4 py-6">
				<div className="flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2">
						<div className="rounded-lg bg-white dark:bg-black p-2 flex-shrink-0">
							<BriefcaseBusiness className="h-6 w-6 text-black dark:text-white" />
						</div>
						<span className="text-2xl font-bold text-black">FreelancerOS</span>
					</Link>

					<div className="hidden md:flex items-center gap-8">
						<Link href="/features" className="text-gray-600 hover:text-black transition-colors">Features</Link>
						<Link href="/pricing" className="text-black font-medium">Pricing</Link>
						<Link href="/testimonials" className="text-gray-600 hover:text-black transition-colors">Testimonials</Link>
						<Link href="/blog" className="text-gray-600 hover:text-black transition-colors">Blog</Link>
					</div>

					<div className="flex items-center gap-4">
						<Button asChild variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
							<Link href="/auth/signin">Sign In</Link>
						</Button>
						<Button asChild className="bg-black text-white hover:bg-gray-800">
							<Link href="/auth/signup">Get Started</Link>
						</Button>
					</div>
				</div>
			</nav>

			<div className="container mx-auto px-4 py-16">
				{/* Header */}
				<div className="text-center mb-16">
					<Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
						Pricing
					</Badge>
					<h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
						Simple, Transparent Pricing
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Choose the plan that's right for your freelance business. All plans include core features with different usage limits.
					</p>

					{/* Billing Toggle */}
					<div className="flex items-center justify-center mt-8 space-x-4">
						<span className={`text-sm ${!isAnnual ? 'font-medium text-black' : 'text-gray-500'}`}>
							Monthly
						</span>
						<Switch
							checked={isAnnual}
							onCheckedChange={setIsAnnual}
						/>
						<div className="flex items-center">
							<span className={`text-sm ${isAnnual ? 'font-medium text-black' : 'text-gray-500'}`}>
								Annual
							</span>
							<Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
								Save 20%
							</Badge>
						</div>
					</div>
				</div>

				{/* Pricing Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{plans.map((plan) => (
						<Card
							key={plan.id}
							className={`border-2 ${plan.name === 'Pro' ? 'border-black shadow-lg' : 'border-gray-200'} relative`}
						>
							{plan.name === 'Pro' && (
								<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
									<Badge className="bg-black text-white hover:bg-black">Most Popular</Badge>
								</div>
							)}
							<CardHeader className="pb-8">
								<CardTitle className="text-2xl font-bold text-black">{plan.name}</CardTitle>
								<div className="mt-4">
									<span className="text-4xl font-bold text-black">
										${isAnnual ? Math.round(plan.price_annually / 12) : plan.price_monthly}
									</span>
									<span className="text-gray-500 ml-2">
										/month
									</span>
									{isAnnual && (
										<p className="text-sm text-gray-500 mt-1">
											Billed annually (${plan.price_annually}/year)
										</p>
									)}
								</div>
								<p className="text-gray-600 mt-4">
									{plan.description}
								</p>
							</CardHeader>
							<CardContent className="space-y-8">
								{/* Feature List */}
								<div className="space-y-4">
									{(plan.features as string[]).map((feature, index) => (
										<div key={index} className="flex items-start">
											<Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
											<span className="text-gray-700">{feature}</span>
										</div>
									))}
								</div>

								{/* Usage Limits */}
								<div className="space-y-2 pt-4 border-t border-gray-200">
									<h4 className="font-medium text-black mb-3">Usage Limits</h4>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-gray-600">Clients</span>
											<span className="font-medium text-black">
												{plan.usage_limits.clients === 999999 ? 'Unlimited' : plan.usage_limits.clients}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600">Proposals</span>
											<span className="font-medium text-black">
												{plan.usage_limits.proposals === 999999 ? 'Unlimited' : plan.usage_limits.proposals}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600">Projects</span>
											<span className="font-medium text-black">
												{plan.usage_limits.projects === 999999 ? 'Unlimited' : plan.usage_limits.projects}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600">Invoices</span>
											<span className="font-medium text-black">
												{plan.usage_limits.invoices === 999999 ? 'Unlimited' : plan.usage_limits.invoices}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600">Storage</span>
											<span className="font-medium text-black">
												{plan.usage_limits.storage_mb >= 1024
													? `${plan.usage_limits.storage_mb / 1024} GB`
													: `${plan.usage_limits.storage_mb} MB`}
											</span>
										</div>
									</div>
								</div>

								{/* Action Button */}
								<Button
									onClick={() => handleCheckout(plan.id)}
									disabled={plan.id === currentPlan || checkoutLoading === plan.id}
									className={`w-full ${plan.name === 'Pro'
										? 'bg-black text-white hover:bg-gray-800'
										: 'bg-white text-black border-2 border-black hover:bg-gray-50'
										}`}
								>
									{checkoutLoading === plan.id ? (
										<>
											<span className="animate-pulse mr-2">...</span>
											Processing
										</>
									) : (
										getButtonText(plan)
									)}
								</Button>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Features Comparison */}
				<div className="mt-24 max-w-6xl mx-auto">
					<h2 className="text-3xl font-bold text-black text-center mb-12">Compare All Features</h2>

					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="border-b-2 border-gray-200">
									<th className="py-4 px-6 text-left text-black font-medium">Feature</th>
									{plans.map((plan) => (
										<th key={plan.id} className="py-4 px-6 text-center text-black font-medium">
											{plan.name}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{/* Client Management */}
								<tr className="border-b border-gray-200 bg-gray-50">
									<td colSpan={4} className="py-3 px-6 text-black font-medium">Client Management</td>
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Client Database</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.usage_limits.clients === 999999 ? (
												<span className="text-black">Unlimited</span>
											) : (
												<span className="text-black">{plan.usage_limits.clients} clients</span>
											)}
										</td>
									))}
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Client Portal</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.name === 'Free' ? (
												<X className="h-5 w-5 text-red-500 mx-auto" />
											) : (
												<Check className="h-5 w-5 text-green-500 mx-auto" />
											)}
										</td>
									))}
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Client Interactions</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.name === 'Free' ? (
												<span className="text-black">Basic</span>
											) : (
												<span className="text-black">Advanced</span>
											)}
										</td>
									))}
								</tr>

								{/* Proposals & Projects */}
								<tr className="border-b border-gray-200 bg-gray-50">
									<td colSpan={4} className="py-3 px-6 text-black font-medium">Proposals & Projects</td>
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Proposals</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.usage_limits.proposals === 999999 ? (
												<span className="text-black">Unlimited</span>
											) : (
												<span className="text-black">{plan.usage_limits.proposals} proposals</span>
											)}
										</td>
									))}
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Projects</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.usage_limits.projects === 999999 ? (
												<span className="text-black">Unlimited</span>
											) : (
												<span className="text-black">{plan.usage_limits.projects} projects</span>
											)}
										</td>
									))}
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Milestone Tracking</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											<Check className="h-5 w-5 text-green-500 mx-auto" />
										</td>
									))}
								</tr>

								{/* Invoicing */}
								<tr className="border-b border-gray-200 bg-gray-50">
									<td colSpan={4} className="py-3 px-6 text-black font-medium">Invoicing</td>
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Invoices</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.usage_limits.invoices === 999999 ? (
												<span className="text-black">Unlimited</span>
											) : (
												<span className="text-black">{plan.usage_limits.invoices} invoices</span>
											)}
										</td>
									))}
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Custom Branding</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.name === 'Free' ? (
												<X className="h-5 w-5 text-red-500 mx-auto" />
											) : (
												<Check className="h-5 w-5 text-green-500 mx-auto" />
											)}
										</td>
									))}
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Recurring Invoices</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.name === 'Free' || plan.name === 'Pro' ? (
												<X className="h-5 w-5 text-red-500 mx-auto" />
											) : (
												<Check className="h-5 w-5 text-green-500 mx-auto" />
											)}
										</td>
									))}
								</tr>

								{/* Time Tracking */}
								<tr className="border-b border-gray-200 bg-gray-50">
									<td colSpan={4} className="py-3 px-6 text-black font-medium">Time Tracking</td>
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Time Tracking</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											<Check className="h-5 w-5 text-green-500 mx-auto" />
										</td>
									))}
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Time Analytics</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.name === 'Free' ? (
												<span className="text-black">Basic</span>
											) : (
												<span className="text-black">Advanced</span>
											)}
										</td>
									))}
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Billable Hours</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											<Check className="h-5 w-5 text-green-500 mx-auto" />
										</td>
									))}
								</tr>

								{/* Support & Other */}
								<tr className="border-b border-gray-200 bg-gray-50">
									<td colSpan={4} className="py-3 px-6 text-black font-medium">Support & Other</td>
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Customer Support</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.name === 'Free' ? (
												<span className="text-black">Email</span>
											) : plan.name === 'Pro' ? (
												<span className="text-black">Priority Email</span>
											) : (
												<span className="text-black">Priority Support</span>
											)}
										</td>
									))}
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">API Access</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.name === 'Business' ? (
												<Check className="h-5 w-5 text-green-500 mx-auto" />
											) : (
												<X className="h-5 w-5 text-red-500 mx-auto" />
											)}
										</td>
									))}
								</tr>
								<tr className="border-b border-gray-200">
									<td className="py-3 px-6 text-gray-700">Storage</td>
									{plans.map((plan) => (
										<td key={plan.id} className="py-3 px-6 text-center">
											{plan.usage_limits.storage_mb >= 1024
												? `${plan.usage_limits.storage_mb / 1024} GB`
												: `${plan.usage_limits.storage_mb} MB`}
										</td>
									))}
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Plan Benefits */}
				<div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
						<div className="flex items-start gap-4 mb-6">
							<div className="bg-blue-100 p-3 rounded-lg">
								<Zap className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-black mb-2">Boost Your Productivity</h3>
								<p className="text-gray-600">
									Save hours each week with automated workflows, templates, and integrated tools designed specifically for freelancers.
								</p>
							</div>
						</div>
						<ul className="space-y-3">
							<li className="flex items-start gap-2">
								<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
								<span className="text-gray-700">Automated proposal creation</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
								<span className="text-gray-700">One-click time tracking</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
								<span className="text-gray-700">Invoice generation from time entries</span>
							</li>
						</ul>
					</div>

					<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
						<div className="flex items-start gap-4 mb-6">
							<div className="bg-green-100 p-3 rounded-lg">
								<BarChart3 className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-black mb-2">Grow Your Business</h3>
								<p className="text-gray-600">
									Get insights into your business performance and identify opportunities for growth with detailed analytics.
								</p>
							</div>
						</div>
						<ul className="space-y-3">
							<li className="flex items-start gap-2">
								<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
								<span className="text-gray-700">Revenue forecasting</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
								<span className="text-gray-700">Client acquisition metrics</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
								<span className="text-gray-700">Profitability analysis</span>
							</li>
						</ul>
					</div>

					<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
						<div className="flex items-start gap-4 mb-6">
							<div className="bg-purple-100 p-3 rounded-lg">
								<Globe className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-black mb-2">Impress Your Clients</h3>
								<p className="text-gray-600">
									Present a professional image to clients with branded proposals, invoices, and a dedicated client portal.
								</p>
							</div>
						</div>
						<ul className="space-y-3">
							<li className="flex items-start gap-2">
								<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
								<span className="text-gray-700">Custom branding options</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
								<span className="text-gray-700">Professional client portal</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
								<span className="text-gray-700">Seamless client communication</span>
							</li>
						</ul>
					</div>
				</div>

				{/* FAQs */}
				<div className="mt-24 max-w-3xl mx-auto">
					<h2 className="text-3xl font-bold text-black text-center mb-12">Frequently Asked Questions</h2>

					<div className="space-y-8">
						<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
							<h3 className="text-xl font-semibold text-black mb-3">Can I change plans later?</h3>
							<p className="text-gray-600">
								Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes will take effect at the end of your current billing cycle.
							</p>
						</div>

						<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
							<h3 className="text-xl font-semibold text-black mb-3">How does the Free plan work?</h3>
							<p className="text-gray-600">
								The Free plan gives you access to core features with usage limits. It's perfect for freelancers just starting out or those with minimal needs. There's no time limit on the Free plan.
							</p>
						</div>

						<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
							<h3 className="text-xl font-semibold text-black mb-3">Do you offer refunds?</h3>
							<p className="text-gray-600">
								We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact our support team within 14 days of your purchase for a full refund.
							</p>
						</div>

						<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
							<h3 className="text-xl font-semibold text-black mb-3">What payment methods do you accept?</h3>
							<p className="text-gray-600">
								We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe.
							</p>
						</div>

						<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
							<h3 className="text-xl font-semibold text-black mb-3">What happens if I exceed my usage limits?</h3>
							<p className="text-gray-600">
								You'll receive notifications as you approach your limits. Once you reach a limit, you'll need to upgrade to a higher plan to continue creating new resources of that type. Existing resources will remain accessible.
							</p>
						</div>

						<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
							<h3 className="text-xl font-semibold text-black mb-3">Is there a free trial for paid plans?</h3>
							<p className="text-gray-600">
								Yes, we offer a 14-day free trial for all paid plans. No credit card is required to start your trial, and you can cancel anytime before the trial ends without being charged.
							</p>
						</div>
					</div>
				</div>

				{/* Testimonials */}
				<div className="mt-24 max-w-6xl mx-auto">
					<h2 className="text-3xl font-bold text-black text-center mb-12">What Our Customers Say</h2>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
							<div className="flex items-center gap-1 mb-4">
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
							</div>
							<p className="text-gray-700 mb-6">
								"The Pro plan has been worth every penny. The client portal alone has elevated my business and impressed my clients. I've seen a 30% increase in repeat business since upgrading."
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
									<span className="text-blue-600 font-bold">DM</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">David Martinez</h4>
									<p className="text-gray-500 text-sm">UX Designer</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
							<div className="flex items-center gap-1 mb-4">
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
							</div>
							<p className="text-gray-700 mb-6">
								"I started with the Free plan and quickly outgrew it as my business expanded. Upgrading to Pro was a no-brainer - the unlimited invoices and proposals have been essential for my growing client base."
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
									<span className="text-green-600 font-bold">SJ</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">Sarah Johnson</h4>
									<p className="text-gray-500 text-sm">Content Strategist</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
							<div className="flex items-center gap-1 mb-4">
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
							</div>
							<p className="text-gray-700 mb-6">
								"As my agency grew, we upgraded to the Business plan. The team collaboration features and advanced analytics have been crucial for managing our expanding client roster and team members."
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
									<span className="text-purple-600 font-bold">RK</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">Robert Kim</h4>
									<p className="text-gray-500 text-sm">Agency Owner</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* CTA */}
				<div className="mt-24 text-center bg-black text-white rounded-2xl p-12 max-w-6xl mx-auto">
					<h2 className="text-3xl font-bold mb-4">Ready to streamline your freelance business?</h2>
					<p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
						Join thousands of freelancers who trust FreelancerOS to manage their business efficiently.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg">
							<Link href="/auth/signup">
								Start Free Trial
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
							<Link href="/auth/signin">Sign In</Link>
						</Button>
					</div>
					<p className="mt-6 text-gray-400 flex items-center justify-center gap-2">
						<Shield className="h-4 w-4" />
						No credit card required for free trial
					</p>
				</div>
			</div>

			{/* Footer */}
			<footer className="py-12 bg-gray-50 mt-24">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						<div>
							<div className="flex items-center gap-2 mb-4">
								<div className="rounded-lg bg-white dark:bg-black p-2 flex-shrink-0">
									<BriefcaseBusiness className="h-6 w-6 text-black dark:text-white" />
								</div>
								<span className="text-xl font-bold text-black">FreelancerOS</span>
							</div>
							<p className="text-gray-600 mb-4">
								The complete operating system for freelancers and independent professionals.
							</p>
						</div>

						<div>
							<h4 className="text-black font-semibold mb-4">Product</h4>
							<ul className="space-y-3">
								<li><Link href="/features" className="text-gray-600 hover:text-black transition-colors">Features</Link></li>
								<li><Link href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</Link></li>
								<li><Link href="/testimonials" className="text-gray-600 hover:text-black transition-colors">Testimonials</Link></li>
							</ul>
						</div>

						<div>
							<h4 className="text-black font-semibold mb-4">Resources</h4>
							<ul className="space-y-3">
								<li><Link href="/blog" className="text-gray-600 hover:text-black transition-colors">Blog</Link></li>
								<li><Link href="/help" className="text-gray-600 hover:text-black transition-colors">Help Center</Link></li>
								<li><Link href="/guides" className="text-gray-600 hover:text-black transition-colors">Guides</Link></li>
							</ul>
						</div>

						<div>
							<h4 className="text-black font-semibold mb-4">Company</h4>
							<ul className="space-y-3">
								<li><Link href="/about" className="text-gray-600 hover:text-black transition-colors">About Us</Link></li>
								<li><Link href="/privacy" className="text-gray-600 hover:text-black transition-colors">Privacy Policy</Link></li>
								<li><Link href="/terms" className="text-gray-600 hover:text-black transition-colors">Terms of Service</Link></li>
							</ul>
						</div>
					</div>

					<div className="border-t border-gray-200 pt-8 text-center">
						<p className="text-gray-500">© 2025 FreelancerOS. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

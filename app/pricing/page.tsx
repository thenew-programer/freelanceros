'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, CreditCard, Zap, Shield, Clock, Users, FileText, ArrowRight } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-black mb-4">
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
                  className={`w-full ${
                    plan.name === 'Pro' 
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

        {/* FAQs */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-black mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes will take effect at the end of your current billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-2">How does the Free plan work?</h3>
              <p className="text-gray-600">
                The Free plan gives you access to core features with usage limits. It's perfect for freelancers just starting out or those with minimal needs. There's no time limit on the Free plan.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact our support team within 14 days of your purchase for a full refund.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-2">What happens if I exceed my usage limits?</h3>
              <p className="text-gray-600">
                You'll receive notifications as you approach your limits. Once you reach a limit, you'll need to upgrade to a higher plan to continue creating new resources of that type. Existing resources will remain accessible.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Ready to streamline your freelance business?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of freelancers who trust FreelancerOS to manage their business efficiently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800">
              <Link href="/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gray-300 text-black hover:bg-gray-50">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
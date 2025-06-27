'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Download, 
  Shield, 
  Zap,
  BarChart3
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { getCurrentUser } from '@/lib/auth';
import { 
  getUserSubscription, 
  getSubscriptionPlans, 
  getBillingEvents, 
  getUserUsage,
  createStripePortalSession,
  cancelSubscription
} from '@/lib/subscriptions';
import { format, addMonths } from 'date-fns';
import { toast } from 'sonner';
import type { Subscription, SubscriptionPlan, BillingEvent, UsageTracking } from '@/lib/supabase';

interface SubscriptionWithPlan extends Subscription {
  plan: SubscriptionPlan;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingEvents, setBillingEvents] = useState<BillingEvent[]>([]);
  const [usageData, setUsageData] = useState<UsageTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadBillingData();
    
    // Check for success/canceled params from Stripe redirect
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success) {
      toast.success('Subscription updated successfully!');
    } else if (canceled) {
      toast.info('Subscription update canceled');
    }
  }, [searchParams]);

  const loadBillingData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const [
        { data: subscriptionData },
        { data: plansData },
        { data: eventsData },
        { data: usageData }
      ] = await Promise.all([
        getUserSubscription(user.id),
        getSubscriptionPlans(),
        getBillingEvents(user.id, 10),
        getUserUsage(user.id)
      ]);

      setSubscription(subscriptionData || null);
      setPlans(plansData || []);
      setBillingEvents(eventsData || []);
      setUsageData(usageData || []);
    } catch (error) {
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setActionLoading('manage');
      
      const { user } = await getCurrentUser();
      if (!user) return;
      
      // Create Stripe portal session
      const { url } = await createStripePortalSession(user.id);
      
      // Redirect to Stripe portal
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to open billing portal');
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setActionLoading('cancel');
      
      const { error } = await cancelSubscription(subscription.id);
      
      if (error) {
        toast.error('Failed to cancel subscription');
        return;
      }
      
      toast.success('Subscription will be canceled at the end of the billing period');
      setShowCancelDialog(false);
      loadBillingData();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      past_due: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800',
      incomplete: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getEventTypeBadge = (eventType: string) => {
    const eventColors: Record<string, string> = {
      subscription_created: 'bg-green-100 text-green-800',
      subscription_updated: 'bg-blue-100 text-blue-800',
      subscription_canceled: 'bg-gray-100 text-gray-800',
      invoice_paid: 'bg-green-100 text-green-800',
      invoice_payment_failed: 'bg-red-100 text-red-800',
    };
    
    const eventNames: Record<string, string> = {
      subscription_created: 'Subscription Created',
      subscription_updated: 'Subscription Updated',
      subscription_canceled: 'Subscription Canceled',
      invoice_paid: 'Payment Successful',
      invoice_payment_failed: 'Payment Failed',
    };
    
    return (
      <Badge className={eventColors[eventType] || 'bg-gray-100 text-gray-800'}>
        {eventNames[eventType] || eventType}
      </Badge>
    );
  };

  const getUsagePercentage = (resourceType: string) => {
    if (!subscription || !usageData) return 0;
    
    const usage = usageData.find(u => u.resource_type === resourceType);
    if (!usage) return 0;
    
    const limit = subscription.plan.usage_limits[resourceType] || 0;
    if (limit === 0) return 0;
    
    return Math.min(Math.round((usage.current_usage / limit) * 100), 100);
  };

  const getNextBillingDate = () => {
    if (!subscription) return 'N/A';
    
    return format(new Date(subscription.current_period_end), 'MMMM d, yyyy');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Billing & Subscription</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>

        {/* Current Plan */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black dark:text-white">Current Plan</CardTitle>
              {getStatusBadge(subscription?.status || 'active')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                  {subscription?.plan.name || 'Free'} Plan
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {subscription?.plan.description || 'Basic freelancing tools for individuals just getting started'}
                </p>
                
                {subscription?.status === 'active' && subscription.plan.price_monthly > 0 && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      Next billing date: {getNextBillingDate()}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <CreditCard className="h-4 w-4 mr-2" />
                      {subscription.billing_cycle === 'annually' ? 'Annual' : 'Monthly'} billing
                    </div>
                  </div>
                )}
                
                {subscription?.cancel_at_period_end && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                          Your subscription will end on {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          You can reactivate your subscription before this date to continue using premium features.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {subscription?.status === 'active' && subscription.plan.price_monthly > 0 && !subscription.cancel_at_period_end && (
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    variant="outline"
                    className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={actionLoading === 'cancel'}
                  >
                    {actionLoading === 'cancel' ? 'Processing...' : 'Cancel Plan'}
                  </Button>
                )}
                
                {subscription?.stripe_subscription_id && (
                  <Button
                    onClick={handleManageSubscription}
                    disabled={actionLoading === 'manage'}
                    className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    {actionLoading === 'manage' ? 'Loading...' : 'Manage Subscription'}
                  </Button>
                )}
                
                {(!subscription || subscription.plan.price_monthly === 0) && (
                  <Button
                    onClick={() => router.push('/pricing')}
                    className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    Upgrade Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Overview */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Usage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-black dark:text-white">Clients</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usageData.find(u => u.resource_type === 'clients')?.current_usage || 0} of {subscription?.plan.usage_limits.clients === 999999 ? 'Unlimited' : subscription?.plan.usage_limits.clients || 0}
                    </span>
                    <span className="text-sm font-medium text-black dark:text-white">
                      {getUsagePercentage('clients')}%
                    </span>
                  </div>
                  <Progress value={getUsagePercentage('clients')} className="h-2" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-black dark:text-white">Proposals</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usageData.find(u => u.resource_type === 'proposals')?.current_usage || 0} of {subscription?.plan.usage_limits.proposals === 999999 ? 'Unlimited' : subscription?.plan.usage_limits.proposals || 0}
                    </span>
                    <span className="text-sm font-medium text-black dark:text-white">
                      {getUsagePercentage('proposals')}%
                    </span>
                  </div>
                  <Progress value={getUsagePercentage('proposals')} className="h-2" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-black dark:text-white">Projects</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usageData.find(u => u.resource_type === 'projects')?.current_usage || 0} of {subscription?.plan.usage_limits.projects === 999999 ? 'Unlimited' : subscription?.plan.usage_limits.projects || 0}
                    </span>
                    <span className="text-sm font-medium text-black dark:text-white">
                      {getUsagePercentage('projects')}%
                    </span>
                  </div>
                  <Progress value={getUsagePercentage('projects')} className="h-2" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-black dark:text-white">Invoices</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usageData.find(u => u.resource_type === 'invoices')?.current_usage || 0} of {subscription?.plan.usage_limits.invoices === 999999 ? 'Unlimited' : subscription?.plan.usage_limits.invoices || 0}
                    </span>
                    <span className="text-sm font-medium text-black dark:text-white">
                      {getUsagePercentage('invoices')}%
                    </span>
                  </div>
                  <Progress value={getUsagePercentage('invoices')} className="h-2" />
                </div>
              </div>
            </div>
            
            {/* Storage Usage */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-black dark:text-white mb-4">Storage</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {usageData.find(u => u.resource_type === 'storage_mb')?.current_usage || 0} MB of {
                      subscription?.plan.usage_limits.storage_mb && subscription.plan.usage_limits.storage_mb >= 1024 
                        ? `${subscription.plan.usage_limits.storage_mb / 1024} GB` 
                        : `${subscription?.plan.usage_limits.storage_mb || 0} MB`
                    }
                  </span>
                  <span className="text-sm font-medium text-black dark:text-white">
                    {getUsagePercentage('storage_mb')}%
                  </span>
                </div>
                <Progress value={getUsagePercentage('storage_mb')} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Available Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`p-6 rounded-lg border-2 ${
                    subscription?.plan_id === plan.id 
                      ? 'border-black dark:border-white' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-black dark:text-white">{plan.name}</h3>
                    {subscription?.plan_id === plan.id && (
                      <Badge className="bg-black text-white dark:bg-white dark:text-black">Current</Badge>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-black dark:text-white">
                      ${plan.price_monthly}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {plan.description}
                  </p>
                  
                  <Button
                    onClick={() => router.push('/pricing')}
                    disabled={subscription?.plan_id === plan.id}
                    className={`w-full ${
                      plan.name === 'Pro' 
                        ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200' 
                        : 'bg-white text-black border-2 border-black hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-white dark:hover:bg-gray-700'
                    }`}
                  >
                    {subscription?.plan_id === plan.id ? 'Current Plan' : 'Switch Plan'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black dark:text-white">Billing History</CardTitle>
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600"
              >
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {billingEvents.length > 0 ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="text-black dark:text-white font-medium">Date</TableHead>
                      <TableHead className="text-black dark:text-white font-medium">Description</TableHead>
                      <TableHead className="text-black dark:text-white font-medium">Amount</TableHead>
                      <TableHead className="text-black dark:text-white font-medium">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingEvents.map((event) => (
                      <TableRow key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="font-medium text-black dark:text-white">
                          {format(new Date(event.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {getEventTypeBadge(event.event_type)}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          {event.amount ? `$${event.amount.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            event.status === 'succeeded' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No billing history available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">Unlock Premium Features</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upgrade to access advanced features like client portal, custom branding, and unlimited resources.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">Detailed Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get insights into your business performance with comprehensive analytics and reporting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">Priority Support</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get faster responses and dedicated support with our premium plans.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cancel Subscription Dialog */}
        <ConfirmationDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          title="Cancel Subscription"
          description="Are you sure you want to cancel your subscription? You'll still have access to premium features until the end of your current billing period."
          confirmText={actionLoading === 'cancel' ? "Processing..." : "Yes, Cancel Subscription"}
          onConfirm={handleCancelSubscription}
          variant="destructive"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>
    </DashboardLayout>
  );
}
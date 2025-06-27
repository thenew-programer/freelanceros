import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getUserSubscription, getUserUsage, checkFeatureAccess, checkResourceLimit } from '@/lib/subscriptions';
import type { Subscription, SubscriptionPlan, UsageTracking } from '@/lib/supabase';

interface SubscriptionWithPlan extends Subscription {
  plan: SubscriptionPlan;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionWithPlan | null;
  usageData: UsageTracking[];
  isLoading: boolean;
  hasFeatureAccess: (feature: string) => Promise<boolean>;
  canUseResource: (resourceType: string, increment?: number) => Promise<boolean>;
  getUsagePercentage: (resourceType: string) => number;
  isSubscriptionActive: boolean;
  isPremium: boolean;
  refreshSubscription: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [usageData, setUsageData] = useState<UsageTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featureAccessCache, setFeatureAccessCache] = useState<Record<string, boolean>>({});
  const [resourceLimitCache, setResourceLimitCache] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const [{ data: subscriptionData }, { data: usageData }] = await Promise.all([
        getUserSubscription(user.id),
        getUserUsage(user.id)
      ]);

      setSubscription(subscriptionData || null);
      setUsageData(usageData || []);
      
      // Reset caches
      setFeatureAccessCache({});
      setResourceLimitCache({});
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeatureAccess = async (feature: string): Promise<boolean> => {
    // Check cache first
    if (featureAccessCache[feature] !== undefined) {
      return featureAccessCache[feature];
    }
    
    try {
      const { user } = await getCurrentUser();
      if (!user) return false;
      
      const hasAccess = await checkFeatureAccess(user.id, feature);
      
      // Update cache
      setFeatureAccessCache(prev => ({
        ...prev,
        [feature]: hasAccess
      }));
      
      return hasAccess;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  };

  const canUseResource = async (resourceType: string, increment: number = 1): Promise<boolean> => {
    // Check cache first
    const cacheKey = `${resourceType}:${increment}`;
    if (resourceLimitCache[cacheKey] !== undefined) {
      return resourceLimitCache[cacheKey];
    }
    
    try {
      const { user } = await getCurrentUser();
      if (!user) return false;
      
      const canUse = await checkResourceLimit(user.id, resourceType, increment);
      
      // Update cache
      setResourceLimitCache(prev => ({
        ...prev,
        [cacheKey]: canUse
      }));
      
      return canUse;
    } catch (error) {
      console.error('Error checking resource limit:', error);
      return false;
    }
  };

  const getUsagePercentage = (resourceType: string): number => {
    if (!subscription || !usageData) return 0;
    
    const usage = usageData.find(u => u.resource_type === resourceType);
    if (!usage) return 0;
    
    const limit = subscription.plan.usage_limits[resourceType] || 0;
    if (limit === 0) return 0;
    
    return Math.min(Math.round((usage.current_usage / limit) * 100), 100);
  };

  const isSubscriptionActive = !!subscription && ['active', 'trialing'].includes(subscription.status);
  
  const isPremium = isSubscriptionActive && subscription.plan.price_monthly > 0;

  return {
    subscription,
    usageData,
    isLoading,
    hasFeatureAccess,
    canUseResource,
    getUsagePercentage,
    isSubscriptionActive,
    isPremium,
    refreshSubscription: loadSubscriptionData
  };
}
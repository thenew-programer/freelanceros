'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureGateProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
  hasAccess: boolean;
}

export function FeatureGate({ children, feature, fallback, hasAccess }: FeatureGateProps) {
  const router = useRouter();
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
      <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Lock className="h-6 w-6 text-gray-500 dark:text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-black dark:text-white mb-2">
        {feature} is a premium feature
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Upgrade to a premium plan to access {feature.toLowerCase()} and many more advanced features.
      </p>
      <Button
        onClick={() => router.push('/pricing')}
        className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        <Zap className="mr-2 h-4 w-4" />
        Upgrade Now
      </Button>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UsageLimitAlertProps {
  resourceType: string;
  currentUsage: number;
  limit: number;
  onClose: () => void;
}

export function UsageLimitAlert({ resourceType, currentUsage, limit, onClose }: UsageLimitAlertProps) {
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();
  
  const usagePercentage = Math.min(Math.round((currentUsage / limit) * 100), 100);
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = currentUsage >= limit;
  
  const resourceNames: Record<string, string> = {
    clients: 'clients',
    proposals: 'proposals',
    projects: 'projects',
    invoices: 'invoices',
    storage_mb: 'storage',
  };
  
  const resourceName = resourceNames[resourceType] || resourceType;

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <Card className={`border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                {isAtLimit 
                  ? `You've reached your ${resourceName} limit` 
                  : `You're approaching your ${resourceName} limit`}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-full"
              >
                <span className="sr-only">Close</span>
                <span aria-hidden="true">×</span>
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-700 dark:text-yellow-300">
                    {currentUsage} of {limit} {resourceName}
                  </span>
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    {usagePercentage}%
                  </span>
                </div>
                <Progress 
                  value={usagePercentage} 
                  className="h-2 bg-yellow-200 dark:bg-yellow-800"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {isAtLimit 
                    ? `Upgrade your plan to create more ${resourceName}.` 
                    : `You can create ${limit - currentUsage} more ${resourceName} on your current plan.`}
                </p>
                <Button
                  onClick={handleUpgrade}
                  size="sm"
                  className="bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
                >
                  <Zap className="mr-1 h-3 w-3" />
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
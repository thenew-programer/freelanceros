'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  onClose: () => void;
  feature?: string;
}

export function UpgradePrompt({ onClose, feature }: UpgradePromptProps) {
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/pricing');
    onClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md transition-all duration-300 ${isClosing ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-white mr-2" />
            <h3 className="text-lg font-bold text-white">
              {feature ? `Unlock ${feature}` : 'Upgrade to Pro'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-1 h-auto"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {feature 
              ? `Get access to ${feature} and many more premium features by upgrading to our Pro plan.` 
              : 'Take your freelance business to the next level with our Pro plan.'}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Unlimited clients and proposals</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Advanced invoicing features</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Client portal and custom branding</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
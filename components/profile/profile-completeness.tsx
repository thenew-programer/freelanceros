'use client';

import { CheckCircle, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Profile } from '@/lib/supabase';

interface ProfileCompletenessProps {
  profile: Profile;
}

export function ProfileCompleteness({ profile }: ProfileCompletenessProps) {
  const completionItems = [
    { key: 'full_name', label: 'Full Name', completed: !!profile.full_name },
    { key: 'title', label: 'Professional Title', completed: !!profile.title },
    { key: 'bio', label: 'Bio', completed: !!profile.bio },
    { key: 'phone', label: 'Phone Number', completed: !!profile.phone },
    { key: 'location', label: 'Location', completed: !!profile.location },
    { key: 'avatar_url', label: 'Profile Photo', completed: !!profile.avatar_url },
  ];

  const completedCount = completionItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-black dark:text-white">Profile Completeness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completedCount} of {completionItems.length} completed
            </span>
            <span className="text-sm font-medium text-black dark:text-white">
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          {completionItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              {item.completed ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              )}
              <span className={`text-sm ${
                item.completed 
                  ? 'text-black dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {completionPercentage < 100 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Complete your profile to make a better impression on clients and improve your professional presence.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
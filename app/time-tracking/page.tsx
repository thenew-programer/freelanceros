'use client';

import { useState } from 'react';
import { Plus, BarChart3, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimerWidget } from '@/components/time-tracking/timer-widget';
import { TimeEntryForm } from '@/components/time-tracking/time-entry-form';
import { TimeEntriesList } from '@/components/time-tracking/time-entries-list';
import { TimeAnalytics } from '@/components/time-tracking/time-analytics';
import type { TimeEntry } from '@/lib/supabase';

export default function TimeTrackingPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<(TimeEntry & { project?: any; milestone?: any }) | null>(null);
  const [activeTab, setActiveTab] = useState('tracker');

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleEdit = (entry: TimeEntry & { project?: any; milestone?: any }) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Time Tracking</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track time spent on projects and analyze your productivity.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Time Entry
          </Button>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="tracker" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              <Clock className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger 
              value="entries" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              <Plus className="h-4 w-4" />
              Time Entries
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TimerWidget />
              </div>
              <div className="lg:col-span-2">
                <TimeEntriesList onEdit={handleEdit} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="entries" className="space-y-6">
            <TimeEntriesList onEdit={handleEdit} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <TimeAnalytics />
          </TabsContent>
        </Tabs>

        {/* Time Entry Form Modal */}
        {showForm && (
          <TimeEntryForm
            entry={editingEntry || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingEntry(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
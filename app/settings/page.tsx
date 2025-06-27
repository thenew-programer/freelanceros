'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Download, Settings as SettingsIcon, Bell, Building, Palette, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/lib/auth';
import { 
  getUserSettings, 
  updateUserSettings, 
  getBusinessSettings, 
  updateBusinessSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
  exportUserData
} from '@/lib/settings';
import { toast } from 'sonner';
import type { UserSettings, BusinessSettings, NotificationPreferences } from '@/lib/supabase';

const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  date_format: z.string(),
  time_format: z.enum(['12h', '24h']),
  first_day_of_week: z.number().min(0).max(6),
});

const businessSettingsSchema = z.object({
  currency: z.string(),
  tax_rate: z.number().min(0).max(100),
  invoice_prefix: z.string().max(10),
  invoice_number_start: z.number().min(1),
  payment_terms: z.number().min(1),
  default_hourly_rate: z.number().min(0).optional(),
  business_name: z.string().max(100).optional(),
  business_address: z.string().max(500).optional(),
  business_phone: z.string().max(20).optional(),
  business_email: z.string().email().optional(),
  tax_id: z.string().max(50).optional(),
});

type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;

const currencies = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
];

const dateFormats = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (UK)' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)' },
  { value: 'dd.MM.yyyy', label: 'DD.MM.YYYY (German)' },
];

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const userForm = useForm<UserSettingsFormData>({
    resolver: zodResolver(userSettingsSchema),
  });

  const businessForm = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(businessSettingsSchema),
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const [
        { data: userSettingsData },
        { data: businessSettingsData },
        { data: notificationPrefsData }
      ] = await Promise.all([
        getUserSettings(user.id),
        getBusinessSettings(user.id),
        getNotificationPreferences(user.id)
      ]);

      if (userSettingsData) {
        setUserSettings(userSettingsData);
        userForm.reset({
          theme: userSettingsData.theme as any,
          language: userSettingsData.language,
          date_format: userSettingsData.date_format,
          time_format: userSettingsData.time_format as any,
          first_day_of_week: userSettingsData.first_day_of_week,
        });
      }

      if (businessSettingsData) {
        setBusinessSettings(businessSettingsData);
        businessForm.reset({
          currency: businessSettingsData.currency,
          tax_rate: businessSettingsData.tax_rate,
          invoice_prefix: businessSettingsData.invoice_prefix,
          invoice_number_start: businessSettingsData.invoice_number_start,
          payment_terms: businessSettingsData.payment_terms,
          default_hourly_rate: businessSettingsData.default_hourly_rate || undefined,
          business_name: businessSettingsData.business_name || '',
          business_address: businessSettingsData.business_address || '',
          business_phone: businessSettingsData.business_phone || '',
          business_email: businessSettingsData.business_email || '',
          tax_id: businessSettingsData.tax_id || '',
        });
      }

      if (notificationPrefsData) {
        setNotificationPrefs(notificationPrefsData);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSettingsSubmit = async (data: UserSettingsFormData) => {
    setSaving(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data: updatedSettings, error } = await updateUserSettings(user.id, data);
      if (error) {
        toast.error('Failed to update settings');
        return;
      }

      setUserSettings(updatedSettings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleBusinessSettingsSubmit = async (data: BusinessSettingsFormData) => {
    setSaving(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data: updatedSettings, error } = await updateBusinessSettings(user.id, data);
      if (error) {
        toast.error('Failed to update business settings');
        return;
      }

      setBusinessSettings(updatedSettings);
      toast.success('Business settings updated successfully!');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data: updatedPrefs, error } = await updateNotificationPreferences(user.id, {
        [key]: value
      });

      if (error) {
        toast.error('Failed to update notification preferences');
        return;
      }

      setNotificationPrefs(updatedPrefs);
      toast.success('Notification preferences updated!');
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await exportUserData(user.id);
      if (error) {
        toast.error('Failed to export data');
        return;
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `freelanceros-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setExporting(false);
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your FreelancerOS experience and manage your preferences.
            </p>
          </div>
          <Button
            onClick={handleExportData}
            disabled={exporting}
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {exporting ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="general" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger 
              value="business" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              <Building className="h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">General Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={userForm.handleSubmit(handleUserSettingsSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-black dark:text-white">Language</Label>
                      <Select
                        value={userForm.watch('language')}
                        onValueChange={(value) => userForm.setValue('language', value)}
                      >
                        <SelectTrigger className="border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-black dark:text-white">Date Format</Label>
                      <Select
                        value={userForm.watch('date_format')}
                        onValueChange={(value) => userForm.setValue('date_format', value)}
                      >
                        <SelectTrigger className="border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {dateFormats.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-black dark:text-white">Time Format</Label>
                      <Select
                        value={userForm.watch('time_format')}
                        onValueChange={(value) => userForm.setValue('time_format', value as any)}
                      >
                        <SelectTrigger className="border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select time format" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-black dark:text-white">First Day of Week</Label>
                      <Select
                        value={userForm.watch('first_day_of_week')?.toString()}
                        onValueChange={(value) => userForm.setValue('first_day_of_week', parseInt(value))}
                      >
                        <SelectTrigger className="border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select first day" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="submit"
                      disabled={saving || !userForm.formState.isDirty}
                      className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                      {saving ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-pulse" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Settings */}
          <TabsContent value="business" className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Business Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={businessForm.handleSubmit(handleBusinessSettingsSubmit)} className="space-y-6">
                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-black dark:text-white">Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business_name" className="text-black dark:text-white">
                          Business Name
                        </Label>
                        <Input
                          id="business_name"
                          placeholder="Your Business Name"
                          className="border-gray-300 dark:border-gray-600"
                          {...businessForm.register('business_name')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="business_email" className="text-black dark:text-white">
                          Business Email
                        </Label>
                        <Input
                          id="business_email"
                          type="email"
                          placeholder="business@example.com"
                          className="border-gray-300 dark:border-gray-600"
                          {...businessForm.register('business_email')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="business_phone" className="text-black dark:text-white">
                          Business Phone
                        </Label>
                        <Input
                          id="business_phone"
                          placeholder="+1 (555) 123-4567"
                          className="border-gray-300 dark:border-gray-600"
                          {...businessForm.register('business_phone')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tax_id" className="text-black dark:text-white">
                          Tax ID / EIN
                        </Label>
                        <Input
                          id="tax_id"
                          placeholder="12-3456789"
                          className="border-gray-300 dark:border-gray-600"
                          {...businessForm.register('tax_id')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_address" className="text-black dark:text-white">
                        Business Address
                      </Label>
                      <Input
                        id="business_address"
                        placeholder="123 Business St, City, State 12345"
                        className="border-gray-300 dark:border-gray-600"
                        {...businessForm.register('business_address')}
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  {/* Financial Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-black dark:text-white">Financial Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-black dark:text-white">Currency</Label>
                        <Select
                          value={businessForm.watch('currency')}
                          onValueChange={(value) => businessForm.setValue('currency', value)}
                        >
                          <SelectTrigger className="border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            {currencies.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tax_rate" className="text-black dark:text-white">
                          Tax Rate (%)
                        </Label>
                        <Input
                          id="tax_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="8.25"
                          className="border-gray-300 dark:border-gray-600"
                          {...businessForm.register('tax_rate', { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="default_hourly_rate" className="text-black dark:text-white">
                          Default Hourly Rate
                        </Label>
                        <Input
                          id="default_hourly_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="75.00"
                          className="border-gray-300 dark:border-gray-600"
                          {...businessForm.register('default_hourly_rate', { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment_terms" className="text-black dark:text-white">
                          Payment Terms (days)
                        </Label>
                        <Input
                          id="payment_terms"
                          type="number"
                          min="1"
                          placeholder="30"
                          className="border-gray-300 dark:border-gray-600"
                          {...businessForm.register('payment_terms', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  {/* Invoice Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-black dark:text-white">Invoice Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invoice_prefix" className="text-black dark:text-white">
                          Invoice Prefix
                        </Label>
                        <Input
                          id="invoice_prefix"
                          placeholder="INV"
                          maxLength={10}
                          className="border-gray-300 dark:border-gray-600"
                          {...businessForm.register('invoice_prefix')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="invoice_number_start" className="text-black dark:text-white">
                          Starting Invoice Number
                        </Label>
                        <Input
                          id="invoice_number_start"
                          type="number"
                          min="1"
                          placeholder="1"
                          className="border-gray-300 dark:border-gray-600"
                          {...businessForm.register('invoice_number_start', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="submit"
                      disabled={saving || !businessForm.formState.isDirty}
                      className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                      {saving ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-pulse" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                {notificationPrefs && (
                  <div className="space-y-6">
                    {/* General Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-black dark:text-white">General</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-black dark:text-white">Email Notifications</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch
                            checked={notificationPrefs.email_notifications}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate('email_notifications', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-black dark:text-white">Push Notifications</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Receive browser push notifications
                            </p>
                          </div>
                          <Switch
                            checked={notificationPrefs.push_notifications}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate('push_notifications', checked)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-200 dark:bg-gray-700" />

                    {/* Project Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-black dark:text-white">Project Updates</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-black dark:text-white">Proposal Updates</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              When proposals are approved, rejected, or commented on
                            </p>
                          </div>
                          <Switch
                            checked={notificationPrefs.proposal_updates}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate('proposal_updates', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-black dark:text-white">Project Updates</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              When project status changes or new messages are received
                            </p>
                          </div>
                          <Switch
                            checked={notificationPrefs.project_updates}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate('project_updates', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-black dark:text-white">Milestone Updates</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              When milestones are completed or approaching deadlines
                            </p>
                          </div>
                          <Switch
                            checked={notificationPrefs.milestone_updates}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate('milestone_updates', checked)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-200 dark:bg-gray-700" />

                    {/* Other Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-black dark:text-white">Other</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-black dark:text-white">Time Tracking Reminders</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Daily reminders to log your time
                            </p>
                          </div>
                          <Switch
                            checked={notificationPrefs.time_tracking_reminders}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate('time_tracking_reminders', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-black dark:text-white">Payment Notifications</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              When payments are received or invoices are due
                            </p>
                          </div>
                          <Switch
                            checked={notificationPrefs.payment_notifications}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate('payment_notifications', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-black dark:text-white">Weekly Summary</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Weekly summary of your activity and earnings
                            </p>
                          </div>
                          <Switch
                            checked={notificationPrefs.weekly_summary}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate('weekly_summary', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-black dark:text-white">Marketing Emails</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Product updates, tips, and promotional content
                            </p>
                          </div>
                          <Switch
                            checked={notificationPrefs.marketing_emails}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate('marketing_emails', checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Appearance & Display</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-black dark:text-white">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['light', 'dark', 'system'].map((theme) => (
                        <div
                          key={theme}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            userForm.watch('theme') === theme
                              ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          onClick={() => userForm.setValue('theme', theme as any)}
                        >
                          <div className="text-center">
                            <div className={`w-12 h-8 mx-auto mb-2 rounded ${
                              theme === 'light' ? 'bg-white border border-gray-300' :
                              theme === 'dark' ? 'bg-gray-900 border border-gray-700' :
                              'bg-gradient-to-r from-white to-gray-900 border border-gray-300'
                            }`}></div>
                            <p className="text-sm font-medium text-black dark:text-white capitalize">
                              {theme}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={userForm.handleSubmit(handleUserSettingsSubmit)}
                      disabled={saving || !userForm.formState.isDirty}
                      className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                      {saving ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-pulse" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
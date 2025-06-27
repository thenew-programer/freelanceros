'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Eye, EyeOff, Globe, MapPin, Phone, Mail } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { ProfileCompleteness } from '@/components/profile/profile-completeness';
import { getCurrentUser, getProfile } from '@/lib/auth';
import { updateProfile } from '@/lib/settings';
import { toast } from 'sonner';
import type { Profile } from '@/lib/supabase';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  website: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  timezone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const watchedValues = watch();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getProfile(user.id);
      if (error) {
        toast.error('Failed to load profile');
        return;
      }

      setProfile(data);
      
      // Set form values
      setValue('full_name', data.full_name || '');
      setValue('title', data.title || '');
      setValue('bio', data.bio || '');
      setValue('phone', data.phone || '');
      setValue('website', data.website || '');
      setValue('location', data.location || '');
      setValue('timezone', data.timezone || 'UTC');
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data: updatedProfile, error } = await updateProfile(user.id, {
        full_name: data.full_name,
        title: data.title || undefined,
        bio: data.bio || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        location: data.location || undefined,
        timezone: data.timezone || 'UTC',
      });

      if (error) {
        toast.error('Failed to update profile');
        return;
      }

      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: url });
    }
  };

  const getUserInitials = () => {
    if (!profile?.full_name) return 'U';
    return profile.full_name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Profile not found</p>
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
            <h1 className="text-3xl font-bold text-black dark:text-white">Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your professional profile and personal information.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {showPreview ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="edit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="edit" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              Edit Profile
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              Client Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Avatar Upload */}
                      <div className="flex justify-center">
                        <AvatarUpload
                          currentAvatarUrl={profile.avatar_url}
                          userInitials={getUserInitials()}
                          onAvatarUpdate={handleAvatarUpdate}
                        />
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name" className="text-black dark:text-white">
                            Full Name *
                          </Label>
                          <Input
                            id="full_name"
                            placeholder="Enter your full name"
                            className="border-gray-300 dark:border-gray-600"
                            {...register('full_name')}
                          />
                          {errors.full_name && (
                            <p className="text-sm text-red-600">{errors.full_name.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-black dark:text-white">
                            Professional Title
                          </Label>
                          <Input
                            id="title"
                            placeholder="e.g., Full Stack Developer"
                            className="border-gray-300 dark:border-gray-600"
                            {...register('title')}
                          />
                          {errors.title && (
                            <p className="text-sm text-red-600">{errors.title.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-black dark:text-white">
                          Professional Bio
                        </Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell clients about your experience, skills, and what makes you unique..."
                          rows={4}
                          className="border-gray-300 dark:border-gray-600"
                          {...register('bio')}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {watchedValues.bio?.length || 0}/500 characters
                        </p>
                        {errors.bio && (
                          <p className="text-sm text-red-600">{errors.bio.message}</p>
                        )}
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-black dark:text-white">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            placeholder="+1 (555) 123-4567"
                            className="border-gray-300 dark:border-gray-600"
                            {...register('phone')}
                          />
                          {errors.phone && (
                            <p className="text-sm text-red-600">{errors.phone.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-black dark:text-white">
                            Website
                          </Label>
                          <Input
                            id="website"
                            placeholder="https://yourwebsite.com"
                            className="border-gray-300 dark:border-gray-600"
                            {...register('website')}
                          />
                          {errors.website && (
                            <p className="text-sm text-red-600">{errors.website.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Location and Timezone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-black dark:text-white">
                            Location
                          </Label>
                          <Input
                            id="location"
                            placeholder="City, Country"
                            className="border-gray-300 dark:border-gray-600"
                            {...register('location')}
                          />
                          {errors.location && (
                            <p className="text-sm text-red-600">{errors.location.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-black dark:text-white">Timezone</Label>
                          <Select
                            value={watchedValues.timezone}
                            onValueChange={(value) => setValue('timezone', value)}
                          >
                            <SelectTrigger className="border-gray-300 dark:border-gray-600">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              {timezones.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                  {tz.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          type="submit"
                          disabled={saving || !isDirty}
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
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <ProfileCompleteness profile={profile} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {/* Client-facing preview */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">How Clients See Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name || 'Profile'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-semibold text-gray-400 dark:text-gray-500">
                            {getUserInitials()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-black dark:text-white">
                        {watchedValues.full_name || profile.full_name || 'Your Name'}
                      </h2>
                      {(watchedValues.title || profile.title) && (
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                          {watchedValues.title || profile.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {(watchedValues.bio || profile.bio) && (
                    <div className="text-center">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {watchedValues.bio || profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(watchedValues.location || profile.location) && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{watchedValues.location || profile.location}</span>
                      </div>
                    )}
                    
                    {(watchedValues.phone || profile.phone) && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        <span>{watchedValues.phone || profile.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                    
                    {(watchedValues.website || profile.website) && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Globe className="h-4 w-4" />
                        <a
                          href={watchedValues.website || profile.website || ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-black dark:hover:text-white transition-colors"
                        >
                          {(watchedValues.website || profile.website)?.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
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
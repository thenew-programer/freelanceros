'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient, updateClient } from '@/lib/clients';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';
import type { Client } from '@/lib/supabase';

const clientSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(255),
  contact_name: z.string().min(1, 'Contact name is required').max(255),
  contact_email: z.string().email('Please enter a valid email address'),
  contact_phone: z.string().max(20).optional(),
  website: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  status: z.enum(['potential', 'active', 'past', 'archived']),
  source: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  tags: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Client;
  onSuccess: () => void;
  onCancel: () => void;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Marketing',
  'Consulting',
  'Non-profit',
  'Government',
  'Other',
];

const sources = [
  'Referral',
  'Website',
  'Social Media',
  'Cold Outreach',
  'Networking',
  'Advertisement',
  'Partner',
  'Other',
];

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? {
      company_name: client.company_name,
      contact_name: client.contact_name,
      contact_email: client.contact_email,
      contact_phone: client.contact_phone || '',
      website: client.website || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      postal_code: client.postal_code || '',
      country: client.country || 'United States',
      industry: client.industry || '',
      company_size: client.company_size as any || undefined,
      status: client.status as any,
      source: client.source || '',
      notes: client.notes || '',
      tags: client.tags?.join(', ') || '',
    } : {
      status: 'potential',
      country: 'United States',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in to manage clients');
        return;
      }

      const clientData = {
        ...data,
        user_id: user.id,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
        website: data.website || null,
        contact_phone: data.contact_phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postal_code: data.postal_code || null,
        country: data.country || null,
        industry: data.industry || null,
        company_size: data.company_size || null,
        source: data.source || null,
        notes: data.notes || null,
      };

      if (isEditing) {
        const { error } = await updateClient(client.id, clientData);
        if (error) {
          toast.error('Failed to update client');
          return;
        }
        toast.success('Client updated successfully!');
      } else {
        const { error } = await createClient(clientData);
        if (error) {
          toast.error('Failed to create client');
          return;
        }
        toast.success('Client created successfully!');
      }

      onSuccess();
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {isEditing ? 'Edit Client' : 'Add New Client'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-black dark:text-white">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-black dark:text-white">
                  Company Name *
                </Label>
                <Input
                  id="company_name"
                  placeholder="Enter company name"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('company_name')}
                />
                {errors.company_name && (
                  <p className="text-sm text-red-600">{errors.company_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_name" className="text-black dark:text-white">
                  Contact Name *
                </Label>
                <Input
                  id="contact_name"
                  placeholder="Enter contact name"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('contact_name')}
                />
                {errors.contact_name && (
                  <p className="text-sm text-red-600">{errors.contact_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email" className="text-black dark:text-white">
                  Email Address *
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="Enter email address"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('contact_email')}
                />
                {errors.contact_email && (
                  <p className="text-sm text-red-600">{errors.contact_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-black dark:text-white">
                  Phone Number
                </Label>
                <Input
                  id="contact_phone"
                  placeholder="Enter phone number"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('contact_phone')}
                />
                {errors.contact_phone && (
                  <p className="text-sm text-red-600">{errors.contact_phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-black dark:text-white">
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('website')}
                />
                {errors.website && (
                  <p className="text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-black dark:text-white">Status</Label>
                <Select value={watch('status')} onValueChange={(value) => setValue('status', value as any)}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="potential">Potential</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-black dark:text-white">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address" className="text-black dark:text-white">
                  Street Address
                </Label>
                <Input
                  id="address"
                  placeholder="Enter street address"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('address')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-black dark:text-white">
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('city')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-black dark:text-white">
                  State/Province
                </Label>
                <Input
                  id="state"
                  placeholder="Enter state or province"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('state')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code" className="text-black dark:text-white">
                  Postal Code
                </Label>
                <Input
                  id="postal_code"
                  placeholder="Enter postal code"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('postal_code')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-black dark:text-white">
                  Country
                </Label>
                <Input
                  id="country"
                  placeholder="Enter country"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('country')}
                />
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-black dark:text-white">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-black dark:text-white">Industry</Label>
                <Select value={watch('industry')} onValueChange={(value) => setValue('industry', value)}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-black dark:text-white">Company Size</Label>
                <Select value={watch('company_size')} onValueChange={(value) => setValue('company_size', value as any)}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-black dark:text-white">Source</Label>
                <Select value={watch('source')} onValueChange={(value) => setValue('source', value)}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="How did you find them?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-black dark:text-white">Additional Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-black dark:text-white">
                  Tags
                </Label>
                <Input
                  id="tags"
                  placeholder="Enter tags separated by commas (e.g., high-value, tech, startup)"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('tags')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Separate multiple tags with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-black dark:text-white">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this client..."
                  rows={4}
                  className="border-gray-300 dark:border-gray-600"
                  {...register('notes')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {watch('notes')?.length || 0}/2000 characters
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {isLoading ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-pulse" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Client' : 'Create Client'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
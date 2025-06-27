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
import { Switch } from '@/components/ui/switch';
import { createClientInteraction } from '@/lib/clients';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';

const interactionSchema = z.object({
  type: z.enum(['email', 'phone', 'meeting', 'proposal', 'contract', 'note', 'follow_up']),
  subject: z.string().min(1, 'Subject is required').max(255),
  description: z.string().max(2000).optional(),
  interaction_date: z.string().min(1, 'Date is required'),
  duration_minutes: z.number().min(0).optional(),
  outcome: z.string().max(500).optional(),
  follow_up_required: z.boolean().default(false),
  follow_up_date: z.string().optional(),
});

type InteractionFormData = z.infer<typeof interactionSchema>;

interface InteractionFormProps {
  clientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const interactionTypes = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'contract', label: 'Contract' },
  { value: 'note', label: 'Note' },
  { value: 'follow_up', label: 'Follow-up' },
];

export function InteractionForm({ clientId, onSuccess, onCancel }: InteractionFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      interaction_date: new Date().toISOString().split('T')[0],
      follow_up_required: false,
    },
  });

  const followUpRequired = watch('follow_up_required');

  const onSubmit = async (data: InteractionFormData) => {
    setIsLoading(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in to log interactions');
        return;
      }

      const interactionData = {
        client_id: clientId,
        user_id: user.id,
        type: data.type,
        subject: data.subject,
        description: data.description || null,
        interaction_date: new Date(data.interaction_date).toISOString(),
        duration_minutes: data.duration_minutes || null,
        outcome: data.outcome || null,
        follow_up_required: data.follow_up_required,
        follow_up_date: data.follow_up_required && data.follow_up_date 
          ? new Date(data.follow_up_date).toISOString() 
          : null,
        attachments: null,
      };

      const { error } = await createClientInteraction(interactionData);
      if (error) {
        toast.error('Failed to log interaction');
        return;
      }

      toast.success('Interaction logged successfully!');
      onSuccess();
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-black dark:text-white">Log Client Interaction</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-black dark:text-white">Interaction Type *</Label>
              <Select value={watch('type')} onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select interaction type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {interactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interaction_date" className="text-black dark:text-white">
                Date *
              </Label>
              <Input
                id="interaction_date"
                type="date"
                className="border-gray-300 dark:border-gray-600"
                {...register('interaction_date')}
              />
              {errors.interaction_date && (
                <p className="text-sm text-red-600">{errors.interaction_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-black dark:text-white">
              Subject *
            </Label>
            <Input
              id="subject"
              placeholder="Brief description of the interaction"
              className="border-gray-300 dark:border-gray-600"
              {...register('subject')}
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-black dark:text-white">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Detailed notes about the interaction..."
              rows={4}
              className="border-gray-300 dark:border-gray-600"
              {...register('description')}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {watch('description')?.length || 0}/2000 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="text-black dark:text-white">
                Duration (minutes)
              </Label>
              <Input
                id="duration_minutes"
                type="number"
                min="0"
                placeholder="e.g., 30"
                className="border-gray-300 dark:border-gray-600"
                {...register('duration_minutes', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome" className="text-black dark:text-white">
                Outcome
              </Label>
              <Input
                id="outcome"
                placeholder="e.g., Scheduled follow-up meeting"
                className="border-gray-300 dark:border-gray-600"
                {...register('outcome')}
              />
            </div>
          </div>

          {/* Follow-up */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="follow_up_required"
                checked={followUpRequired}
                onCheckedChange={(checked) => setValue('follow_up_required', checked)}
              />
              <Label htmlFor="follow_up_required" className="text-black dark:text-white">
                Follow-up required
              </Label>
            </div>

            {followUpRequired && (
              <div className="space-y-2">
                <Label htmlFor="follow_up_date" className="text-black dark:text-white">
                  Follow-up Date
                </Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  className="border-gray-300 dark:border-gray-600"
                  {...register('follow_up_date')}
                />
              </div>
            )}
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Log Interaction
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
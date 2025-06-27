'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { proposalSchema, type ProposalInput } from '@/lib/validations/proposal';
import { createProposal, updateProposal } from '@/lib/proposals';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';
import type { Proposal } from '@/lib/supabase';

interface ProposalFormProps {
  proposal?: Proposal;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProposalForm({ proposal, onSuccess, onCancel }: ProposalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!proposal;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProposalInput>({
    resolver: zodResolver(proposalSchema),
    defaultValues: proposal ? {
      title: proposal.title,
      client_name: proposal.client_name,
      client_email: proposal.client_email,
      amount: proposal.amount,
      description: proposal.description || '',
      status: proposal.status as any,
    } : {
      status: 'draft',
    },
  });

  const status = watch('status');

  const onSubmit = async (data: ProposalInput) => {
    setIsLoading(true);
    
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in to create proposals');
        return;
      }

      if (isEditing) {
        const { error } = await updateProposal(proposal.id, data);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('Proposal updated successfully!');
      } else {
        const { error } = await createProposal({
          ...data,
          user_id: user.id,
          client_id: null,
          description: data.description || null, // Convert empty string or undefined to null
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('Proposal created successfully!');
      }

      onSuccess();
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">
            {isEditing ? 'Edit Proposal' : 'New Proposal'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-black">Title *</Label>
            <Input
              id="title"
              placeholder="Enter proposal title"
              className="border-gray-300 focus:border-black focus:ring-black"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="client_name" className="text-black">Client Name *</Label>
            <Input
              id="client_name"
              placeholder="Enter client name"
              className="border-gray-300 focus:border-black focus:ring-black"
              {...register('client_name')}
            />
            {errors.client_name && (
              <p className="text-sm text-red-600">{errors.client_name.message}</p>
            )}
          </div>

          {/* Client Email */}
          <div className="space-y-2">
            <Label htmlFor="client_email" className="text-black">Client Email *</Label>
            <Input
              id="client_email"
              type="email"
              placeholder="Enter client email"
              className="border-gray-300 focus:border-black focus:ring-black"
              {...register('client_email')}
            />
            {errors.client_email && (
              <p className="text-sm text-red-600">{errors.client_email.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-black">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border-gray-300 focus:border-black focus:ring-black"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-black">Status</Label>
            <Select value={status} onValueChange={(value) => setValue('status', value as any)}>
              <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-black">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter proposal description"
              rows={4}
              className="border-gray-300 focus:border-black focus:ring-black"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 text-black hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Proposal' : 'Create Proposal'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
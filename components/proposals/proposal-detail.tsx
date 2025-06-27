'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { X, Edit, Trash2, ArrowRight, CheckCircle, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { convertProposalToProject } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';
import type { Proposal } from '@/lib/supabase';

interface ProposalDetailProps {
  proposal: Proposal;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusIcons = {
  draft: Clock,
  pending: Send,
  approved: CheckCircle,
  rejected: X,
};

export function ProposalDetail({ proposal, onClose, onEdit, onDelete, onRefresh }: ProposalDetailProps) {
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const StatusIcon = statusIcons[proposal.status as keyof typeof statusIcons];
  const canConvert = proposal.status === 'approved' || proposal.status === 'pending';

  const handleConvertToProject = async () => {
    setIsConverting(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in to convert proposals');
        return;
      }

      const { data: project, error } = await convertProposalToProject(proposal.id, user.id);
      
      if (error) {
        toast.error('Failed to convert proposal to project');
        return;
      }

      toast.success('Proposal successfully converted to project!');
      setShowConvertDialog(false);
      onRefresh();
      onClose();
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-black dark:text-white">Proposal Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Title and Status */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-black dark:text-white mb-2">{proposal.title}</h3>
                <Badge className={`${statusColors[proposal.status as keyof typeof statusColors]} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-black dark:text-white">${proposal.amount.toLocaleString()}</p>
              </div>
            </div>

            {/* Conversion Status */}
            {canConvert && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Ready for Project Conversion</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This proposal can be converted into an active project with automated milestone creation.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowConvertDialog(true)}
                    className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Accept & Convert
                  </Button>
                </div>
              </div>
            )}

            {/* Client Information */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-black dark:text-white mb-1">Client Name</h4>
                <p className="text-gray-600 dark:text-gray-400">{proposal.client_name}</p>
              </div>
              <div>
                <h4 className="font-medium text-black dark:text-white mb-1">Client Email</h4>
                <p className="text-gray-600 dark:text-gray-400">{proposal.client_email}</p>
              </div>
            </div>

            {/* Description */}
            {proposal.description && (
              <div>
                <h4 className="font-medium text-black dark:text-white mb-2">Description</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{proposal.description}</p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-black dark:text-white mb-1">Created</h4>
                <p className="text-gray-600 dark:text-gray-400">{format(new Date(proposal.created_at), 'PPP')}</p>
              </div>
              <div>
                <h4 className="font-medium text-black dark:text-white mb-1">Last Updated</h4>
                <p className="text-gray-600 dark:text-gray-400">{format(new Date(proposal.updated_at), 'PPP')}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onDelete}
              className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button
              onClick={onEdit}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Conversion Confirmation Dialog */}
      <ConfirmationDialog
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
        title="Convert Proposal to Project"
        description="This will create a new project with default milestones based on this proposal. The proposal status will be updated to 'Approved'. This action cannot be undone."
        confirmText={isConverting ? "Converting..." : "Convert to Project"}
        onConfirm={handleConvertToProject}
        icon={<ArrowRight className="h-5 w-5 text-blue-600" />}
      />
    </>
  );
}
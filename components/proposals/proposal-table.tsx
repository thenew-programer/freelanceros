'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteProposal } from '@/lib/proposals';
import { toast } from 'sonner';
import type { Proposal } from '@/lib/supabase';

interface ProposalTableProps {
  proposals: Proposal[];
  onEdit: (proposal: Proposal) => void;
  onView: (proposal: Proposal) => void;
  onRefresh: () => void;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function ProposalTable({ proposals, onEdit, onView, onRefresh }: ProposalTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    
    setDeletingId(id);
    try {
      const { error } = await deleteProposal(id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Proposal deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete proposal');
    } finally {
      setDeletingId(null);
    }
  };

  if (proposals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No proposals found</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="text-black dark:text-white font-medium">Title</TableHead>
            <TableHead className="text-black dark:text-white font-medium">Client</TableHead>
            <TableHead className="text-black dark:text-white font-medium">Amount</TableHead>
            <TableHead className="text-black dark:text-white font-medium">Status</TableHead>
            <TableHead className="text-black dark:text-white font-medium">Created</TableHead>
            <TableHead className="text-black dark:text-white font-medium w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableCell className="font-medium text-black dark:text-white">
                {proposal.title}
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">
                {proposal.client_name}
              </TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">
                ${proposal.amount.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge className={statusColors[proposal.status as keyof typeof statusColors]}>
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">
                {format(new Date(proposal.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DropdownMenuItem onClick={() => onView(proposal)} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(proposal)} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(proposal.id)}
                      disabled={deletingId === proposal.id}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
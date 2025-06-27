'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, FileText, FolderOpen, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { getProposals, getProposalStats } from '@/lib/proposals';
import { getProjectStats } from '@/lib/projects';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Proposal } from '@/lib/supabase';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalStats, setProposalStats] = useState<any>(null);
  const [projectStats, setProjectStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { user } = await getCurrentUser();
        if (!user) return;

        // Load recent proposals
        const { data: proposalsData, error: proposalsError } = await getProposals(user.id);
        if (proposalsError) {
          toast.error('Failed to load proposals');
        } else {
          setProposals(proposalsData?.slice(0, 5) || []);
        }

        // Load proposal stats
        const { data: propStats, error: propStatsError } = await getProposalStats(user.id);
        if (propStatsError) {
          toast.error('Failed to load proposal statistics');
        } else {
          setProposalStats(propStats);
        }

        // Load project stats
        const { data: projStats, error: projStatsError } = await getProjectStats(user.id);
        if (projStatsError) {
          toast.error('Failed to load project statistics');
        } else {
          setProjectStats(projStats);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
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
            <h1 className="text-3xl font-bold text-black">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
              <Link href="/projects">
                <Eye className="mr-2 h-4 w-4" />
                View All Projects
              </Link>
            </Button>
            <Button asChild className="bg-black text-white hover:bg-gray-800">
              <Link href="/proposals">
                <Plus className="mr-2 h-4 w-4" />
                New Proposal
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Proposals</CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{proposalStats?.total || 0}</div>
              <p className="text-xs text-gray-500">
                {proposalStats?.draft || 0} draft, {proposalStats?.pending || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{projectStats?.active || 0}</div>
              <p className="text-xs text-gray-500">
                {projectStats?.total || 0} total projects
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Proposals</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{proposalStats?.pending || 0}</div>
              <p className="text-xs text-gray-500">
                Awaiting client response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Proposals */}
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black">Recent Proposals</CardTitle>
              <Button asChild variant="outline" size="sm" className="border-gray-300 text-black hover:bg-gray-50">
                <Link href="/proposals">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {proposals.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-black font-medium">Title</TableHead>
                      <TableHead className="text-black font-medium">Client</TableHead>
                      <TableHead className="text-black font-medium">Amount</TableHead>
                      <TableHead className="text-black font-medium">Status</TableHead>
                      <TableHead className="text-black font-medium">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposals.map((proposal) => (
                      <TableRow key={proposal.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-black">
                          {proposal.title}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {proposal.client_name}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          ${proposal.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[proposal.status as keyof typeof statusColors]}>
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">No proposals yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first proposal.</p>
                <Button asChild className="bg-black text-white hover:bg-gray-800">
                  <Link href="/proposals">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Proposal
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
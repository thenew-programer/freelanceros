'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, Users, Mail, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { PortalLinkManager } from '@/components/projects/portal-link-manager';
import { getCurrentUser } from '@/lib/auth';
import { getProjectById, updateProject } from '@/lib/projects';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone, getMilestoneStats } from '@/lib/milestones';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Project, Milestone } from '@/lib/supabase';

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const milestoneStatusColors = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const milestoneStatusIcons = {
  pending: Clock,
  in_progress: AlertCircle,
  completed: CheckCircle,
};

interface ProjectWithDetails extends Project {
  proposal?: any;
  milestones?: Milestone[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMilestone, setDeletingMilestone] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadProject();
    }
  }, [params.id]);

  const loadProject = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data: projectData, error: projectError } = await getProjectById(params.id as string, user.id);
      if (projectError || !projectData) {
        toast.error('Project not found');
        router.push('/projects');
        return;
      }

      setProject(projectData);

      // Load milestones
      const { data: milestonesData, error: milestonesError } = await getMilestones(params.id as string, user.id);
      if (milestonesError) {
        toast.error('Failed to load milestones');
      } else {
        setMilestones(milestonesData || []);
      }

      // Load stats
      const { data: statsData } = await getMilestoneStats(params.id as string);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load project');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneStatusUpdate = async (milestoneId: string, newStatus: string) => {
    try {
      const { error } = await updateMilestone(milestoneId, { status: newStatus });
      if (error) {
        toast.error('Failed to update milestone status');
        return;
      }
      toast.success('Milestone status updated');
      loadProject(); // Reload to update stats
    } catch (error) {
      toast.error('Failed to update milestone status');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await deleteMilestone(milestoneId);
      if (error) {
        toast.error('Failed to delete milestone');
        return;
      }
      toast.success('Milestone deleted');
      setShowDeleteDialog(false);
      setDeletingMilestone(null);
      loadProject();
    } catch (error) {
      toast.error('Failed to delete milestone');
    }
  };

  const handlePortalIdUpdated = (newPortalId: string) => {
    if (project) {
      setProject({ ...project, client_portal_id: newPortalId });
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

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Project not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-gray-300 dark:border-gray-600 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white truncate">
                {project.title}
              </h1>
              <Badge className={`${statusColors[project.status as keyof typeof statusColors]} flex-shrink-0`}>
                {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Project overview and milestone management</p>
          </div>
        </div>

        {/* Project Overview Grid - Improved responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Client Information */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Client Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.proposal ? (
                <>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Name</p>
                    <p className="text-sm font-medium text-black dark:text-white break-words">
                      {project.proposal.client_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Email</p>
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-black dark:text-white truncate">
                        {project.proposal.client_email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Budget</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-black dark:text-white">
                        ${project.proposal.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No client information available</p>
              )}
            </CardContent>
          </Card>

          {/* Project Progress */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Progress Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Overall Progress</span>
                      <span className="text-sm font-bold text-black dark:text-white">{stats.completionPercentage}%</span>
                    </div>
                    <Progress value={stats.completionPercentage} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-gray-600 dark:text-gray-400">{stats.pending}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No progress data available</p>
              )}
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Project Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Created</p>
                <p className="text-sm font-medium text-black dark:text-white">
                  {format(new Date(project.created_at), 'PPP')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Last Updated</p>
                <p className="text-sm font-medium text-black dark:text-white">
                  {format(new Date(project.updated_at), 'PPP')}
                </p>
              </div>
              {project.description && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Description</p>
                  <p className="text-xs text-black dark:text-white line-clamp-3 break-words">
                    {project.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portal Link Manager - Full width on medium screens, single column on xl+ */}
          <div className="md:col-span-2 xl:col-span-1">
            <PortalLinkManager 
              project={project} 
              onPortalIdUpdated={handlePortalIdUpdated}
            />
          </div>
        </div>

        {/* Milestones */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-black dark:text-white">Project Milestones</CardTitle>
              <Button
                size="sm"
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {milestones.length > 0 ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800">
                        <TableHead className="text-black dark:text-white font-medium min-w-[200px]">Title</TableHead>
                        <TableHead className="text-black dark:text-white font-medium min-w-[120px]">Status</TableHead>
                        <TableHead className="text-black dark:text-white font-medium min-w-[120px]">Due Date</TableHead>
                        <TableHead className="text-black dark:text-white font-medium min-w-[160px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {milestones.map((milestone) => {
                        const StatusIcon = milestoneStatusIcons[milestone.status as keyof typeof milestoneStatusIcons];
                        return (
                          <TableRow key={milestone.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell className="min-w-0">
                              <div className="space-y-1">
                                <p className="font-medium text-black dark:text-white break-words">
                                  {milestone.title}
                                </p>
                                {milestone.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 break-words line-clamp-2">
                                    {milestone.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${milestoneStatusColors[milestone.status as keyof typeof milestoneStatusColors]} flex items-center gap-1 w-fit`}>
                                <StatusIcon className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  {milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.replace('_', ' ').slice(1)}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              <span className="text-sm">
                                {milestone.due_date ? format(new Date(milestone.due_date), 'MMM d, yyyy') : 'No due date'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap items-center gap-2">
                                {milestone.status !== 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMilestoneStatusUpdate(
                                      milestone.id,
                                      milestone.status === 'pending' ? 'in_progress' : 'completed'
                                    )}
                                    className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    {milestone.status === 'pending' ? 'Start' : 'Complete'}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setDeletingMilestone(milestone.id);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-black dark:text-white mb-2">No milestones yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Add milestones to track project progress.</p>
                <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Milestone
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Milestone Confirmation */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Milestone"
        description="Are you sure you want to delete this milestone? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deletingMilestone && handleDeleteMilestone(deletingMilestone)}
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </DashboardLayout>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Clock, DollarSign, Tag, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { getTimeEntries, deleteTimeEntry } from '@/lib/time-tracking';
import { getProjects } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';
import { useTimeTrackingStore } from '@/lib/stores/time-tracking-store';
import { toast } from 'sonner';
import type { TimeEntry, Project } from '@/lib/supabase';

interface TimeEntriesListProps {
  onEdit: (entry: TimeEntry & { project?: any; milestone?: any }) => void;
}

export function TimeEntriesList({ onEdit }: TimeEntriesListProps) {
  const {
    timeEntries,
    totalEntries,
    isLoading,
    filters,
    setTimeEntries,
    setTotalEntries,
    setIsLoading,
    setFilters,
    removeTimeEntry,
  } = useTimeTrackingStore();

  const [projects, setProjects] = useState<Project[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const entriesPerPage = 25;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  useEffect(() => {
    loadProjects();
    loadTimeEntries();
  }, []);

  useEffect(() => {
    loadTimeEntries();
  }, [filters, currentPage]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters({ search: searchTerm });
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, setFilters]);

  const loadProjects = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getProjects(user.id);
      if (error) {
        toast.error('Failed to load projects');
        return;
      }
      setProjects(data || []);
    } catch (error) {
      toast.error('Failed to load projects');
    }
  };

  const loadTimeEntries = async () => {
    setIsLoading(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getTimeEntries(user.id, {
        projectId: filters.projectId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: entriesPerPage,
        offset: (currentPage - 1) * entriesPerPage,
      });

      if (error) {
        toast.error('Failed to load time entries');
        return;
      }

      // Filter by search term if provided
      let filteredData = data || [];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(entry =>
          entry.task_name?.toLowerCase().includes(searchLower) ||
          entry.description?.toLowerCase().includes(searchLower) ||
          entry.project?.title?.toLowerCase().includes(searchLower)
        );
      }

      setTimeEntries(filteredData);
      setTotalEntries(filteredData.length);
    } catch (error) {
      toast.error('Failed to load time entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      const { error } = await deleteTimeEntry(entryId);
      if (error) {
        toast.error('Failed to delete time entry');
        return;
      }

      removeTimeEntry(entryId);
      toast.success('Time entry deleted');
      setShowDeleteDialog(false);
      setDeletingEntry(null);
    } catch (error) {
      toast.error('Failed to delete time entry');
    }
  };

  const formatDuration = (duration: string): string => {
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    return duration;
  };

  const calculateEarnings = (entry: TimeEntry): number => {
    if (!entry.is_billable || !entry.hourly_rate) return 0;
    
    const match = entry.duration.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const hours = parseInt(match[1]) + parseInt(match[2]) / 60;
      return hours * entry.hourly_rate;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 dark:border-gray-600"
          />
        </div>

        <Select
          value={filters.projectId || 'all'}
          onValueChange={(value) => {
            setFilters({ projectId: value === 'all' ? undefined : value });
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48 border-gray-300 dark:border-gray-600">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => {
              setFilters({ startDate: e.target.value || undefined });
              setCurrentPage(1);
            }}
            className="border-gray-300 dark:border-gray-600"
          />
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => {
              setFilters({ endDate: e.target.value || undefined });
              setCurrentPage(1);
            }}
            className="border-gray-300 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Time Entries Table */}
      {timeEntries.length > 0 ? (
        <>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="text-black dark:text-white font-medium min-w-[200px]">
                      Task / Project
                    </TableHead>
                    <TableHead className="text-black dark:text-white font-medium min-w-[100px]">
                      Duration
                    </TableHead>
                    <TableHead className="text-black dark:text-white font-medium min-w-[120px]">
                      Date
                    </TableHead>
                    <TableHead className="text-black dark:text-white font-medium min-w-[100px]">
                      Earnings
                    </TableHead>
                    <TableHead className="text-black dark:text-white font-medium min-w-[100px]">
                      Status
                    </TableHead>
                    <TableHead className="text-black dark:text-white font-medium min-w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="min-w-0">
                        <div className="space-y-1">
                          <p className="font-medium text-black dark:text-white">
                            {entry.task_name || 'Untitled Task'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.project?.title || 'Unknown Project'}
                          </p>
                          {entry.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                              {entry.description}
                            </p>
                          )}
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <Tag className="h-2 w-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {entry.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{entry.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-black dark:text-white font-medium">
                          <Clock className="h-3 w-3" />
                          {formatDuration(entry.duration)}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {format(new Date(entry.started_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {entry.is_billable && entry.hourly_rate ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                            <DollarSign className="h-3 w-3" />
                            {calculateEarnings(entry).toFixed(2)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            entry.is_billable
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }
                        >
                          {entry.is_billable ? 'Billable' : 'Non-billable'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(entry)}
                            className="border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDeletingEntry(entry.id);
                              setShowDeleteDialog(true);
                            }}
                            className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
                {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-black dark:text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-black dark:text-white mb-2">No time entries found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filters.search || filters.projectId || filters.startDate || filters.endDate
              ? 'Try adjusting your search or filter criteria.'
              : 'Start tracking time to see your entries here.'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Time Entry"
        description="Are you sure you want to delete this time entry? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deletingEntry && handleDelete(deletingEntry)}
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </div>
  );
}
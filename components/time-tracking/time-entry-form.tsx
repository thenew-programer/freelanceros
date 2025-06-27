'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createTimeEntry, updateTimeEntry } from '@/lib/time-tracking';
import { getProjects } from '@/lib/projects';
import { getMilestones } from '@/lib/milestones';
import { getCurrentUser } from '@/lib/auth';
import { useTimeTrackingStore } from '@/lib/stores/time-tracking-store';
import { toast } from 'sonner';
import type { Project, Milestone, TimeEntry } from '@/lib/supabase';

const timeEntrySchema = z.object({
  project_id: z.string().min(1, 'Project is required'),
  milestone_id: z.string().optional(),
  task_name: z.string().optional(),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  hours: z.number().min(0, 'Hours must be positive').max(24, 'Hours cannot exceed 24'),
  minutes: z.number().min(0, 'Minutes must be positive').max(59, 'Minutes cannot exceed 59'),
  hourly_rate: z.number().min(0, 'Rate must be positive').optional(),
  is_billable: z.boolean().default(true),
  tags: z.string().optional(),
});

type TimeEntryFormData = z.infer<typeof timeEntrySchema>;

interface TimeEntryFormProps {
  entry?: TimeEntry & { project?: any; milestone?: any };
  onSuccess: () => void;
  onCancel: () => void;
}

export function TimeEntryForm({ entry, onSuccess, onCancel }: TimeEntryFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addTimeEntry, updateTimeEntry: updateStoreEntry } = useTimeTrackingStore();

  const isEditing = !!entry;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: entry ? {
      project_id: entry.project_id,
      milestone_id: entry.milestone_id || '',
      task_name: entry.task_name || '',
      description: entry.description || '',
      date: new Date(entry.started_at).toISOString().split('T')[0],
      hours: Math.floor(parseDurationToHours(entry.duration)),
      minutes: Math.round((parseDurationToHours(entry.duration) % 1) * 60),
      hourly_rate: entry.hourly_rate || undefined,
      is_billable: entry.is_billable,
      tags: entry.tags?.join(', ') || '',
    } : {
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      minutes: 0,
      is_billable: true,
    },
  });

  const selectedProjectId = watch('project_id');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadMilestones(selectedProjectId);
    } else {
      setMilestones([]);
      setValue('milestone_id', '');
    }
  }, [selectedProjectId, setValue]);

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

  const loadMilestones = async (projectId: string) => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getMilestones(projectId, user.id);
      if (error) {
        toast.error('Failed to load milestones');
        return;
      }
      setMilestones(data || []);
    } catch (error) {
      toast.error('Failed to load milestones');
    }
  };

  const onSubmit = async (data: TimeEntryFormData) => {
    setIsLoading(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      // Convert hours and minutes to PostgreSQL interval
      const totalMinutes = data.hours * 60 + data.minutes;
      const duration = `${Math.floor(totalMinutes / 60)}:${(totalMinutes % 60).toString().padStart(2, '0')}:00`;

      // Create started_at timestamp
      const startedAt = new Date(`${data.date}T09:00:00`).toISOString();

      const entryData = {
        user_id: user.id,
        project_id: data.project_id,
        milestone_id: data.milestone_id || undefined,
        task_name: data.task_name || undefined,
        description: data.description || undefined,
        duration,
        started_at: startedAt,
        hourly_rate: data.hourly_rate || undefined,
        is_billable: data.is_billable,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      };

      if (isEditing) {
        const { data: updatedEntry, error } = await updateTimeEntry(entry.id, entryData);
        if (error) {
          toast.error('Failed to update time entry');
          return;
        }
        updateStoreEntry(entry.id, updatedEntry);
        toast.success('Time entry updated successfully');
      } else {
        const { data: newEntry, error } = await createTimeEntry(entryData);
        if (error) {
          toast.error('Failed to create time entry');
          return;
        }
        addTimeEntry(newEntry);
        toast.success('Time entry created successfully');
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
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {isEditing ? 'Edit Time Entry' : 'Add Time Entry'}
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
          {/* Project Selection */}
          <div className="space-y-2">
            <Label className="text-black dark:text-white">Project *</Label>
            <Select value={watch('project_id')} onValueChange={(value) => setValue('project_id', value)}>
              <SelectTrigger className="border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project_id && (
              <p className="text-sm text-red-600">{errors.project_id.message}</p>
            )}
          </div>

          {/* Milestone Selection */}
          {selectedProjectId && milestones.length > 0 && (
            <div className="space-y-2">
              <Label className="text-black dark:text-white">Milestone</Label>
              <Select value={watch('milestone_id')} onValueChange={(value) => setValue('milestone_id', value)}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select a milestone (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="">No milestone</SelectItem>
                  {milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="task_name" className="text-black dark:text-white">
              Task Name
            </Label>
            <Input
              id="task_name"
              placeholder="What did you work on?"
              className="border-gray-300 dark:border-gray-600"
              {...register('task_name')}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-black dark:text-white">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                className="border-gray-300 dark:border-gray-600"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours" className="text-black dark:text-white">
                Hours
              </Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="24"
                className="border-gray-300 dark:border-gray-600"
                {...register('hours', { valueAsNumber: true })}
              />
              {errors.hours && (
                <p className="text-sm text-red-600">{errors.hours.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minutes" className="text-black dark:text-white">
                Minutes
              </Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                className="border-gray-300 dark:border-gray-600"
                {...register('minutes', { valueAsNumber: true })}
              />
              {errors.minutes && (
                <p className="text-sm text-red-600">{errors.minutes.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-black dark:text-white">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what you worked on..."
              rows={3}
              className="border-gray-300 dark:border-gray-600"
              {...register('description')}
            />
          </div>

          {/* Billing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate" className="text-black dark:text-white">
                Hourly Rate ($)
              </Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="border-gray-300 dark:border-gray-600"
                {...register('hourly_rate', { valueAsNumber: true })}
              />
              {errors.hourly_rate && (
                <p className="text-sm text-red-600">{errors.hourly_rate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-black dark:text-white">Billing</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="is_billable"
                  checked={watch('is_billable')}
                  onCheckedChange={(checked) => setValue('is_billable', !!checked)}
                />
                <Label htmlFor="is_billable" className="text-sm text-black dark:text-white">
                  This time is billable
                </Label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-black dark:text-white">
              Tags
            </Label>
            <Input
              id="tags"
              placeholder="development, design, meeting (comma-separated)"
              className="border-gray-300 dark:border-gray-600"
              {...register('tags')}
            />
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
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Entry' : 'Create Entry'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function parseDurationToHours(duration: string): number {
  const match = duration.match(/(\d+):(\d+):(\d+)/);
  if (match) {
    return parseInt(match[1]) + parseInt(match[2]) / 60 + parseInt(match[3]) / 3600;
  }
  return 0;
}
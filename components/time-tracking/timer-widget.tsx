'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTimeTrackingStore } from '@/lib/stores/time-tracking-store';
import { startTimer, stopActiveTimer, getActiveTimerSession } from '@/lib/time-tracking';
import { getProjects } from '@/lib/projects';
import { getMilestones } from '@/lib/milestones';
import { getCurrentUser } from '@/lib/auth';
import { formatDuration } from '@/lib/time-tracking';
import { toast } from 'sonner';
import type { Project, Milestone } from '@/lib/supabase';

export function TimerWidget() {
  const {
    activeTimer,
    timerSeconds,
    isTimerRunning,
    isStartingTimer,
    isStoppingTimer,
    setActiveTimer,
    setTimerSeconds,
    setIsTimerRunning,
    setIsStartingTimer,
    setIsStoppingTimer,
    addTimeEntry,
  } = useTimeTrackingStore();

  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadProjects();
    loadActiveTimer();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadMilestones(selectedProjectId);
    } else {
      setMilestones([]);
      setSelectedMilestoneId('');
    }
  }, [selectedProjectId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && activeTimer) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.started_at).getTime();
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        setTimerSeconds(elapsedSeconds);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTimer, setTimerSeconds]);

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

  const loadActiveTimer = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getActiveTimerSession(user.id);
      if (error && error.code !== 'PGRST116') {
        toast.error('Failed to load active timer');
        return;
      }

      if (data) {
        setActiveTimer(data);
        setIsTimerRunning(true);
        setSelectedProjectId(data.project_id);
        setSelectedMilestoneId(data.milestone_id || '');
        setTaskName(data.task_name || '');
        setDescription(data.description || '');
      }
    } catch (error) {
      toast.error('Failed to load active timer');
    }
  };

  const handleStartTimer = async () => {
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }

    setIsStartingTimer(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await startTimer({
        user_id: user.id,
        project_id: selectedProjectId,
        milestone_id: selectedMilestoneId || undefined,
        task_name: taskName || undefined,
        description: description || undefined,
      });

      if (error) {
        toast.error('Failed to start timer');
        return;
      }

      setActiveTimer(data);
      setIsTimerRunning(true);
      setTimerSeconds(0);
      toast.success('Timer started');
    } catch (error) {
      toast.error('Failed to start timer');
    } finally {
      setIsStartingTimer(false);
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    setIsStoppingTimer(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await stopActiveTimer(user.id);
      if (error) {
        toast.error('Failed to stop timer');
        return;
      }

      if (data) {
        addTimeEntry(data);
      }

      setActiveTimer(null);
      setIsTimerRunning(false);
      setTimerSeconds(0);
      toast.success('Timer stopped and time entry created');
    } catch (error) {
      toast.error('Failed to stop timer');
    } finally {
      setIsStoppingTimer(false);
    }
  };

  const canStartTimer = selectedProjectId && !isTimerRunning && !isStartingTimer;
  const canStopTimer = isTimerRunning && !isStoppingTimer;

  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
          <Clock className="h-5 w-5" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-black dark:text-white mb-2">
            {formatDuration(timerSeconds)}
          </div>
          {activeTimer && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {activeTimer.task_name || 'Untitled Task'}
            </div>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center gap-2">
          {!isTimerRunning ? (
            <Button
              onClick={handleStartTimer}
              disabled={!canStartTimer}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="mr-2 h-4 w-4" />
              {isStartingTimer ? 'Starting...' : 'Start'}
            </Button>
          ) : (
            <Button
              onClick={handleStopTimer}
              disabled={!canStopTimer}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="mr-2 h-4 w-4" />
              {isStoppingTimer ? 'Stopping...' : 'Stop'}
            </Button>
          )}
        </div>

        {/* Timer Configuration */}
        {!isTimerRunning && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <Label htmlFor="project" className="text-black dark:text-white">
                Project *
              </Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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
            </div>

            {selectedProjectId && milestones.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="milestone" className="text-black dark:text-white">
                  Milestone
                </Label>
                <Select value={selectedMilestoneId} onValueChange={setSelectedMilestoneId}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select a milestone (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="none">No milestone</SelectItem>
                    {milestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="task-name" className="text-black dark:text-white">
                Task Name
              </Label>
              <Input
                id="task-name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="What are you working on?"
                className="border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-black dark:text-white">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details (optional)"
                className="border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* Active Timer Info */}
        {isTimerRunning && activeTimer && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Project:</span>
                <span className="text-black dark:text-white font-medium">
                  {activeTimer.project?.title || 'Unknown Project'}
                </span>
              </div>
              {activeTimer.milestone && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Milestone:</span>
                  <span className="text-black dark:text-white font-medium">
                    {activeTimer.milestone.title}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Started:</span>
                <span className="text-black dark:text-white font-medium">
                  {new Date(activeTimer.started_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
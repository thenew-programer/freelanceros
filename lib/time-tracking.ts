import { supabase } from './supabase';
import type { TimeEntry, TimerSession } from './supabase';

// Timer Sessions
export async function getActiveTimerSession(userId: string) {
  const { data, error } = await supabase
    .from('timer_sessions')
    .select(`
      *,
      project:projects(id, title),
      milestone:milestones(id, title)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  return { data, error };
}

export async function startTimer(session: {
  user_id: string;
  project_id: string;
  milestone_id?: string;
  task_name?: string;
  description?: string;
}) {
  // First, stop any active timer
  await stopActiveTimer(session.user_id);

  const { data, error } = await supabase
    .from('timer_sessions')
    .insert([{
      ...session,
      started_at: new Date().toISOString(),
      is_active: true,
    }])
    .select()
    .single();

  return { data, error };
}

export async function stopActiveTimer(userId: string) {
  const { data: activeSession, error: fetchError } = await getActiveTimerSession(userId);
  
  if (fetchError || !activeSession) {
    return { data: null, error: fetchError };
  }

  // Calculate duration
  const startTime = new Date(activeSession.started_at);
  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationSeconds = Math.floor(durationMs / 1000);

  // Create time entry
  const { data: timeEntry, error: timeEntryError } = await supabase
    .from('time_entries')
    .insert([{
      user_id: userId,
      project_id: activeSession.project_id,
      milestone_id: activeSession.milestone_id,
      task_name: activeSession.task_name,
      description: activeSession.description,
      duration: `${durationSeconds} seconds`,
      started_at: activeSession.started_at,
      is_billable: true,
    }])
    .select()
    .single();

  if (timeEntryError) {
    return { data: null, error: timeEntryError };
  }

  // Mark timer session as inactive
  const { error: updateError } = await supabase
    .from('timer_sessions')
    .update({ is_active: false })
    .eq('id', activeSession.id);

  return { data: timeEntry, error: updateError };
}

export async function pauseTimer(userId: string) {
  return await stopActiveTimer(userId);
}

// Time Entries
export async function getTimeEntries(userId: string, filters?: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      project:projects(id, title),
      milestone:milestones(id, title)
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId);
  }

  if (filters?.startDate) {
    query = query.gte('started_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('started_at', filters.endDate);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 25)) - 1);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createTimeEntry(entry: {
  user_id: string;
  project_id: string;
  milestone_id?: string;
  task_name?: string;
  description?: string;
  duration: string; // PostgreSQL interval format
  started_at: string;
  hourly_rate?: number;
  is_billable?: boolean;
  tags?: string[];
}) {
  const { data, error } = await supabase
    .from('time_entries')
    .insert([entry])
    .select(`
      *,
      project:projects(id, title),
      milestone:milestones(id, title)
    `)
    .single();

  return { data, error };
}

export async function updateTimeEntry(id: string, updates: Partial<TimeEntry>) {
  const { data, error } = await supabase
    .from('time_entries')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      project:projects(id, title),
      milestone:milestones(id, title)
    `)
    .single();

  return { data, error };
}

export async function deleteTimeEntry(id: string) {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id);

  return { error };
}

// Analytics
export async function getTimeAnalytics(userId: string, filters?: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
}) {
  let query = supabase
    .from('time_entries')
    .select(`
      duration,
      started_at,
      project_id,
      milestone_id,
      is_billable,
      hourly_rate,
      project:projects(title),
      milestone:milestones(title)
    `)
    .eq('user_id', userId);

  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId);
  }

  if (filters?.startDate) {
    query = query.gte('started_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('started_at', filters.endDate);
  }

  const { data, error } = await query;

  if (error) return { data: null, error };

  // Process analytics data
  const analytics = {
    totalHours: 0,
    billableHours: 0,
    totalEarnings: 0,
    projectBreakdown: {} as Record<string, { hours: number; earnings: number; title: string }>,
    dailyBreakdown: {} as Record<string, number>,
    weeklyBreakdown: {} as Record<string, number>,
  };

  data?.forEach((entry) => {
    // Parse duration (PostgreSQL interval to hours)
    const durationMatch = entry.duration.match(/(\d+):(\d+):(\d+)/);
    const hours = durationMatch 
      ? parseInt(durationMatch[1]) + parseInt(durationMatch[2]) / 60 + parseInt(durationMatch[3]) / 3600
      : 0;

    analytics.totalHours += hours;

    if (entry.is_billable) {
      analytics.billableHours += hours;
      if (entry.hourly_rate) {
        analytics.totalEarnings += hours * entry.hourly_rate;
      }
    }

    // Project breakdown
    const projectKey = entry.project_id;
    if (!analytics.projectBreakdown[projectKey]) {
      analytics.projectBreakdown[projectKey] = {
        hours: 0,
        earnings: 0,
        title: 'Unknown Project',
      };
    }
    analytics.projectBreakdown[projectKey].hours += hours;
    if (entry.is_billable && entry.hourly_rate) {
      analytics.projectBreakdown[projectKey].earnings += hours * entry.hourly_rate;
    }

    // Daily breakdown
    const date = new Date(entry.started_at).toISOString().split('T')[0];
    analytics.dailyBreakdown[date] = (analytics.dailyBreakdown[date] || 0) + hours;

    // Weekly breakdown
    const weekStart = getWeekStart(new Date(entry.started_at)).toISOString().split('T')[0];
    analytics.weeklyBreakdown[weekStart] = (analytics.weeklyBreakdown[weekStart] || 0) + hours;
  });

  return { data: analytics, error: null };
}

export async function getProjectTimeStats(projectId: string, userId: string) {
  const { data, error } = await supabase
    .from('time_entries')
    .select('duration, is_billable, hourly_rate')
    .eq('project_id', projectId)
    .eq('user_id', userId);

  if (error) return { data: null, error };

  let totalHours = 0;
  let billableHours = 0;
  let totalEarnings = 0;

  data?.forEach((entry) => {
    const durationMatch = entry.duration.match(/(\d+):(\d+):(\d+)/);
    const hours = durationMatch 
      ? parseInt(durationMatch[1]) + parseInt(durationMatch[2]) / 60 + parseInt(durationMatch[3]) / 3600
      : 0;

    totalHours += hours;

    if (entry.is_billable) {
      billableHours += hours;
      if (entry.hourly_rate) {
        totalEarnings += hours * entry.hourly_rate;
      }
    }
  });

  return {
    data: {
      totalHours: Math.round(totalHours * 100) / 100,
      billableHours: Math.round(billableHours * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      entryCount: data?.length || 0,
    },
    error: null,
  };
}

// Utility functions
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function parseDurationToSeconds(duration: string): number {
  // Handle PostgreSQL interval format or HH:MM:SS format
  const match = duration.match(/(\d+):(\d+):(\d+)/);
  if (match) {
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
  }
  
  // Handle seconds format
  const secondsMatch = duration.match(/(\d+)\s*seconds?/);
  if (secondsMatch) {
    return parseInt(secondsMatch[1]);
  }
  
  return 0;
}
import { supabase } from './supabase';
import type { Milestone } from './supabase';

export async function getMilestones(projectId: string, userId: string) {
  const { data, error } = await supabase
    .from('milestones')
    .select(`
      *,
      project:projects!inner(user_id)
    `)
    .eq('project_id', projectId)
    .eq('project.user_id', userId)
    .order('created_at', { ascending: true });

  return { data, error };
}

export async function createMilestone(milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('milestones')
    .insert([milestone])
    .select()
    .single();

  return { data, error };
}

export async function updateMilestone(id: string, updates: Partial<Milestone>) {
  const { data, error } = await supabase
    .from('milestones')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteMilestone(id: string) {
  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id);

  return { error };
}

export async function getMilestoneStats(projectId: string) {
  const { data: milestones, error } = await supabase
    .from('milestones')
    .select('status')
    .eq('project_id', projectId);

  if (error) return { data: null, error };

  const total = milestones.length;
  const completed = milestones.filter(m => m.status === 'completed').length;
  const inProgress = milestones.filter(m => m.status === 'in_progress').length;
  const pending = milestones.filter(m => m.status === 'pending').length;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    data: {
      total,
      completed,
      inProgress,
      pending,
      completionPercentage,
    },
    error: null,
  };
}
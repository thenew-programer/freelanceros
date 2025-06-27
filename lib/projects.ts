import { supabase } from './supabase';
import { generatePortalId } from './portal';
import type { Project, Milestone } from './supabase';

export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      proposal:proposals(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getProjectById(id: string, userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      proposal:proposals(*),
      milestones(*)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'client_portal_id'>) {
  // Generate a secure portal ID for the new project
  const client_portal_id = generatePortalId();
  
  const { data, error } = await supabase
    .from('projects')
    .insert([{ ...project, client_portal_id }])
    .select()
    .single();

  return { data, error };
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  return { error };
}

export async function getProjectStats(userId: string) {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('status')
    .eq('user_id', userId);

  if (error) return { data: null, error };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    on_hold: projects.filter(p => p.status === 'on_hold').length,
  };

  return { data: stats, error: null };
}

export async function convertProposalToProject(proposalId: string, userId: string) {
  // First, get the proposal details
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('user_id', userId)
    .single();

  if (proposalError || !proposal) {
    return { data: null, error: proposalError || new Error('Proposal not found') };
  }

  // Generate a secure portal ID for the new project
  const client_portal_id = generatePortalId();

  // Create the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert([{
      proposal_id: proposalId,
      user_id: userId,
      title: proposal.title,
      description: proposal.description,
      status: 'active',
      client_portal_id,
    }])
    .select()
    .single();

  if (projectError) {
    return { data: null, error: projectError };
  }

  // Create default milestones based on proposal
  const defaultMilestones = [
    {
      project_id: project.id,
      title: 'Project Kickoff',
      description: 'Initial project setup and client onboarding',
      status: 'pending',
    },
    {
      project_id: project.id,
      title: 'Development Phase',
      description: 'Main development work based on proposal requirements',
      status: 'pending',
    },
    {
      project_id: project.id,
      title: 'Review & Testing',
      description: 'Quality assurance and client review',
      status: 'pending',
    },
    {
      project_id: project.id,
      title: 'Final Delivery',
      description: 'Project completion and handover',
      status: 'pending',
    },
  ];

  const { error: milestonesError } = await supabase
    .from('milestones')
    .insert(defaultMilestones);

  if (milestonesError) {
    // If milestones creation fails, we should still return the project
    console.error('Failed to create default milestones:', milestonesError);
  }

  // Update proposal status to converted
  await supabase
    .from('proposals')
    .update({ status: 'approved' })
    .eq('id', proposalId);

  return { data: project, error: null };
}
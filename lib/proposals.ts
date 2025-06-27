import { supabase } from './supabase';
import type { Proposal } from './supabase';

export async function getProposals(userId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getProposalById(id: string, userId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function createProposal(proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('proposals')
    .insert([proposal])
    .select()
    .single();

  return { data, error };
}

export async function updateProposal(id: string, updates: Partial<Proposal>) {
  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteProposal(id: string) {
  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id);

  return { error };
}

export async function getProposalStats(userId: string) {
  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('status')
    .eq('user_id', userId);

  if (error) return { data: null, error };

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    draft: proposals.filter(p => p.status === 'draft').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  return { data: stats, error: null };
}
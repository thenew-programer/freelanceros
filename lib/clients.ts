import { supabase } from './supabase';
import type { Client, ClientInteraction } from './supabase';

// Client CRUD Operations
export async function getClients(userId: string, filters?: {
  status?: string;
  search?: string;
  industry?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('clients')
    .select(`
      *,
      proposals:proposals(count),
      projects:projects(count)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.industry) {
    query = query.eq('industry', filters.industry);
  }

  if (filters?.search) {
    query = query.or(`company_name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`);
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

export async function getClientById(id: string, userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      proposals:proposals(*),
      projects:projects(*),
      interactions:client_interactions(*)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();

  return { data, error };
}

export async function updateClient(id: string, updates: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  return { error };
}

// Client Interactions
export async function getClientInteractions(clientId: string, userId: string) {
  const { data, error } = await supabase
    .from('client_interactions')
    .select('*')
    .eq('client_id', clientId)
    .eq('user_id', userId)
    .order('interaction_date', { ascending: false });

  return { data, error };
}

export async function createClientInteraction(interaction: Omit<ClientInteraction, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('client_interactions')
    .insert([interaction])
    .select()
    .single();

  return { data, error };
}

export async function updateClientInteraction(id: string, updates: Partial<ClientInteraction>) {
  const { data, error } = await supabase
    .from('client_interactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteClientInteraction(id: string) {
  const { error } = await supabase
    .from('client_interactions')
    .delete()
    .eq('id', id);

  return { error };
}

// Analytics and Reporting
export async function getClientStats(userId: string) {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('status, total_project_value, project_count')
    .eq('user_id', userId);

  if (error) return { data: null, error };

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    potential: clients.filter(c => c.status === 'potential').length,
    past: clients.filter(c => c.status === 'past').length,
    archived: clients.filter(c => c.status === 'archived').length,
    totalValue: clients.reduce((sum, c) => sum + (c.total_project_value || 0), 0),
    totalProjects: clients.reduce((sum, c) => sum + (c.project_count || 0), 0),
    averageValue: clients.length > 0 ? clients.reduce((sum, c) => sum + (c.total_project_value || 0), 0) / clients.length : 0,
  };

  return { data: stats, error: null };
}

export async function getClientRevenueTrend(userId: string, months: number = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const { data, error } = await supabase
    .from('proposals')
    .select('amount, created_at, client_email')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) return { data: null, error };

  // Group by month
  const monthlyRevenue: Record<string, number> = {};
  data?.forEach(proposal => {
    const month = new Date(proposal.created_at).toISOString().slice(0, 7); // YYYY-MM
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + proposal.amount;
  });

  return { data: monthlyRevenue, error: null };
}

export async function getTopClients(userId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('total_project_value', { ascending: false })
    .limit(limit);

  return { data, error };
}

// Bulk Operations
export async function bulkImportClients(userId: string, clients: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) {
  const clientsWithUserId = clients.map(client => ({
    ...client,
    user_id: userId,
  }));

  const { data, error } = await supabase
    .from('clients')
    .insert(clientsWithUserId)
    .select();

  return { data, error };
}

export async function detectDuplicateClients(userId: string, email: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .eq('contact_email', email);

  return { data, error };
}

// Search and Filtering
export async function searchClients(userId: string, query: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .textSearch('company_name', query)
    .limit(10);

  return { data, error };
}

export async function getClientsByIndustry(userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('industry, count(*)')
    .eq('user_id', userId)
    .not('industry', 'is', null)
    .order('count', { ascending: false });

  return { data, error };
}

// Follow-up Management
export async function getUpcomingFollowUps(userId: string) {
  const { data, error } = await supabase
    .from('client_interactions')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('user_id', userId)
    .eq('follow_up_required', true)
    .not('follow_up_date', 'is', null)
    .gte('follow_up_date', new Date().toISOString())
    .order('follow_up_date', { ascending: true });

  return { data, error };
}

export async function getOverdueFollowUps(userId: string) {
  const { data, error } = await supabase
    .from('client_interactions')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('user_id', userId)
    .eq('follow_up_required', true)
    .not('follow_up_date', 'is', null)
    .lt('follow_up_date', new Date().toISOString())
    .order('follow_up_date', { ascending: true });

  return { data, error };
}

// Export functionality
export async function exportClientsData(userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      interactions:client_interactions(*),
      proposals:proposals(*),
      projects:projects(*)
    `)
    .eq('user_id', userId);

  if (error) return { data: null, error };

  // Format data for CSV export
  const csvData = data?.map(client => ({
    'Company Name': client.company_name,
    'Contact Name': client.contact_name,
    'Email': client.contact_email,
    'Phone': client.contact_phone || '',
    'Website': client.website || '',
    'Address': client.address || '',
    'City': client.city || '',
    'State': client.state || '',
    'Postal Code': client.postal_code || '',
    'Country': client.country || '',
    'Industry': client.industry || '',
    'Company Size': client.company_size || '',
    'Status': client.status,
    'Source': client.source || '',
    'Total Project Value': client.total_project_value || 0,
    'Project Count': client.project_count || 0,
    'Last Contact': client.last_contact_date || '',
    'Next Follow Up': client.next_follow_up_date || '',
    'Notes': client.notes || '',
    'Tags': client.tags?.join(', ') || '',
    'Created': client.created_at,
  }));

  return { data: csvData, error: null };
}
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import type { Project } from './supabase';

// Generate a secure, unguessable portal ID using UUID
export function generatePortalId(): string {
  return uuidv4();
}

// Get project by portal ID (public access)
export async function getProjectByPortalId(portalId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      proposal:proposals(*)
    `)
    .eq('client_portal_id', portalId)
    .single();

  return { data, error };
}

// Regenerate portal ID for a project
export async function regeneratePortalId(projectId: string, userId: string) {
  const newPortalId = generatePortalId();
  
  const { data, error } = await supabase
    .from('projects')
    .update({ client_portal_id: newPortalId })
    .eq('id', projectId)
    .eq('user_id', userId)
    .select('client_portal_id')
    .single();

  return { data, error };
}

// Get portal URL for a project
export function getPortalUrl(portalId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/portal/${portalId}`;
  }
  return `/portal/${portalId}`;
}

// Rate limiting for portal access (basic implementation)
const accessAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 50; // Max 50 requests per 15 minutes per IP

  const attempts = accessAttempts.get(ip);
  
  if (!attempts) {
    accessAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    accessAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  // Check if under limit
  if (attempts.count < maxAttempts) {
    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  }

  return false;
}

// Log portal access for monitoring
export async function logPortalAccess(portalId: string, ip?: string, userAgent?: string) {
  // In a production environment, you would log this to a monitoring service
  // or database table for security analysis
  console.log('Portal access:', {
    portalId,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
  });
}
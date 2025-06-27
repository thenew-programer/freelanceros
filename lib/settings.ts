import { supabase } from './supabase';
import type { UserSettings, BusinessSettings, NotificationPreferences } from './supabase';

// User Settings
export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>) {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...settings })
    .select()
    .single();

  return { data, error };
}

// Business Settings
export async function getBusinessSettings(userId: string) {
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function updateBusinessSettings(userId: string, settings: Partial<BusinessSettings>) {
  const { data, error } = await supabase
    .from('business_settings')
    .upsert({ user_id: userId, ...settings })
    .select()
    .single();

  return { data, error };
}

// Notification Preferences
export async function getNotificationPreferences(userId: string) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: userId, ...preferences })
    .select()
    .single();

  return { data, error };
}

// Profile Management
export async function updateProfile(userId: string, updates: {
  full_name?: string;
  title?: string;
  bio?: string;
  phone?: string;
  website?: string;
  location?: string;
  timezone?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// Session Management
export async function getUserSessions(userId: string) {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_activity', { ascending: false });

  return { data, error };
}

export async function revokeSession(sessionId: string) {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('id', sessionId);

  return { error };
}

export async function revokeAllSessions(userId: string, exceptCurrentSession?: string) {
  let query = supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('user_id', userId);

  if (exceptCurrentSession) {
    query = query.neq('id', exceptCurrentSession);
  }

  const { error } = await query;
  return { error };
}

// Data Export
export async function exportUserData(userId: string) {
  try {
    // Get all user data
    const [
      { data: profile },
      { data: proposals },
      { data: projects },
      { data: timeEntries },
      { data: userSettings },
      { data: businessSettings },
      { data: notificationPreferences }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('proposals').select('*').eq('user_id', userId),
      supabase.from('projects').select('*').eq('user_id', userId),
      supabase.from('time_entries').select('*').eq('user_id', userId),
      supabase.from('user_settings').select('*').eq('user_id', userId).single(),
      supabase.from('business_settings').select('*').eq('user_id', userId).single(),
      supabase.from('notification_preferences').select('*').eq('user_id', userId).single()
    ]);

    const exportData = {
      profile,
      proposals: proposals || [],
      projects: projects || [],
      timeEntries: timeEntries || [],
      settings: {
        user: userSettings,
        business: businessSettings,
        notifications: notificationPreferences
      },
      exportedAt: new Date().toISOString()
    };

    return { data: exportData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Account Deletion
export async function deleteUserAccount(userId: string) {
  try {
    // Delete user data in correct order (respecting foreign key constraints)
    await supabase.from('time_entries').delete().eq('user_id', userId);
    await supabase.from('milestones').delete().eq('project_id', 
      supabase.from('projects').select('id').eq('user_id', userId)
    );
    await supabase.from('projects').delete().eq('user_id', userId);
    await supabase.from('proposals').delete().eq('user_id', userId);
    await supabase.from('user_sessions').delete().eq('user_id', userId);
    await supabase.from('notification_preferences').delete().eq('user_id', userId);
    await supabase.from('business_settings').delete().eq('user_id', userId);
    await supabase.from('user_settings').delete().eq('user_id', userId);
    
    // Delete storage files
    await supabase.storage.from('avatars').remove([`${userId}/`]);
    await supabase.storage.from('proposals').remove([`${userId}/`]);
    await supabase.storage.from('project-files').remove([`${userId}/`]);
    
    // Finally delete profile (this will cascade to auth.users)
    await supabase.from('profiles').delete().eq('id', userId);

    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Password Change
export async function changePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  return { data, error };
}

// Password Strength Validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }

  if (/[^a-zA-Z\d]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters');
  }

  const isValid = score >= 4;

  return { isValid, score, feedback };
}
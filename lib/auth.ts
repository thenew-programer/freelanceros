// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function signUp(email: string, password: string, fullName: string) {
  // const supabase = createClientComponentClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  return { data, error };
}

export async function signIn(email: string, password: string) {
  // const supabase = createClientComponentClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  // const supabase = createClientComponentClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string) {
  // const supabase = createClientComponentClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  return { data, error };
}

export async function updatePassword(password: string) {
  // const supabase = createClientComponentClient();
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  return { data, error };
}

export async function getCurrentUser() {
  // const supabase = createClientComponentClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getProfile(userId: string) {
  // const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function updateProfile(userId: string, updates: Partial<{
  full_name: string;
  avatar_url: string;
}>) {
  // const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}
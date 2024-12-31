import { supabase } from '@/lib/supabase/client';
import { AuthError } from '@/lib/types/errors';
import { AUTH_ERROR_MESSAGES } from './errors';
import { getSession } from './session';

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        persistSession: true
      }
    });

    if (error) throw new AuthError('LOGIN_FAILED', AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    if (!data.user) throw new AuthError('LOGIN_FAILED', AUTH_ERROR_MESSAGES.LOGIN_FAILED);

    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut({
      scope: 'global'
    });
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw new AuthError('SIGNOUT_FAILED', 'Failed to sign out');
  }
}
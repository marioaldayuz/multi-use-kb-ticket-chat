import { supabase } from '@/lib/supabase/client';
import { AuthError } from '@/lib/types/errors';

export async function signUpWithEmail(email: string, password: string, userData: { full_name: string }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw new AuthError('SIGNUP_FAILED', error.message);
    if (!data.user) throw new AuthError('SIGNUP_FAILED', 'Failed to create user account');

    return data;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('SIGNUP_FAILED', 'An unexpected error occurred during signup');
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new AuthError('LOGIN_FAILED', 'Invalid email or password');
    if (!data.user) throw new AuthError('LOGIN_FAILED', 'Failed to sign in');

    return data;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('LOGIN_FAILED', 'An unexpected error occurred during sign in');
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AuthError('SIGNOUT_FAILED', 'Failed to sign out');
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('SIGNOUT_FAILED', 'An unexpected error occurred during sign out');
  }
}
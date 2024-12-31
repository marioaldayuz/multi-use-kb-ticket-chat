import { supabase } from '@/lib/supabase/client';
import { AuthError } from '@/lib/types/errors';
import { AUTH_ERROR_MESSAGES } from './errors';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retry(fn, retries - 1);
    }
    throw error;
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await retry(() => 
      supabase.auth.getSession()
    );
    
    if (error) throw new AuthError('SESSION_ERROR', error.message);
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function refreshSession() {
  try {
    const { data: { session }, error } = await retry(() =>
      supabase.auth.refreshSession()
    );
    
    if (error) {
      // Don't throw on refresh errors, just return null
      console.warn('Session refresh warning:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.warn('Session refresh warning:', error);
    return null;
  }
}
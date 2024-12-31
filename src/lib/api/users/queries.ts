import { supabase } from '@/lib/supabase/client';
import type { User } from '@/lib/types';
import { ApiError } from '@/lib/types/errors';
import { AUTH_ERROR_MESSAGES } from '../auth/errors';
import { withRetry } from './retry';

export async function fetchUserById(userId: string): Promise<User> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new ApiError('USER_NOT_FOUND', AUTH_ERROR_MESSAGES.USER_NOT_FOUND);

    return data;
  });
}
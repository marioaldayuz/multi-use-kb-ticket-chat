import { supabase } from '@/lib/supabase/client';
import { ApiError } from '@/lib/types/errors';

export type UserCreationStatus = 'pending' | 'completed' | 'failed';

interface UserStatus {
  status: UserCreationStatus;
  attempts: number;
  lastError: string | null;
}

export async function getUserCreationStatus(userId: string): Promise<UserStatus> {
  const { data, error } = await supabase
    .from('user_creation_status')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw new ApiError('STATUS_FETCH_FAILED', error.message);
  if (!data) throw new ApiError('STATUS_NOT_FOUND', 'User status not found');

  return {
    status: data.status,
    attempts: data.attempts,
    lastError: data.last_error
  };
}
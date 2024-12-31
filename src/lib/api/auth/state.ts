import { User } from '@/lib/types';
import { fetchUserById } from '@/lib/api/users';
import { getSession, refreshSession } from './session';
import { ApiError } from '@/lib/types/errors';

export async function initializeAuthState(): Promise<User | null> {
  try {
    const session = await getSession();
    if (!session?.user) return null;
    return await fetchUserById(session.user.id);
  } catch (error) {
    console.error('Auth initialization failed:', error);
    return null;
  }
}

export async function handleAuthStateChange(session: any): Promise<User | null> {
  if (!session?.user) return null;

  try {
    return await fetchUserById(session.user.id);
  } catch (error) {
    if (error instanceof ApiError && error.code === 'USER_NOT_FOUND') {
      try {
        const refreshedSession = await refreshSession();
        if (!refreshedSession?.user) return null;
        return await fetchUserById(refreshedSession.user.id);
      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError);
        return null;
      }
    }
    console.error('Auth state change error:', error);
    return null;
  }
}
import { AuthError } from '@/lib/types/errors';

export const AUTH_ERROR_MESSAGES = {
  USER_EXISTS: 'An account with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User account not found',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',
  UNKNOWN: 'An unexpected error occurred'
} as const;

export function getAuthErrorMessage(error: any): string {
  if (error?.message?.includes('User already registered')) {
    return AUTH_ERROR_MESSAGES.USER_EXISTS;
  }
  if (error?.code === 'USER_NOT_FOUND') {
    return AUTH_ERROR_MESSAGES.USER_NOT_FOUND;
  }
  return error?.message || AUTH_ERROR_MESSAGES.UNKNOWN;
}
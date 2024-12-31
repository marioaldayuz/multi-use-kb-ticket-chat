import { AuthError } from '@/lib/types/errors';

interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoff?: boolean;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoff: true,
};

export async function withAuthRetry<T>(
  operation: () => Promise<T>,
  errorCode: string,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxAttempts, delayMs, backoff } = { ...DEFAULT_CONFIG, ...config };
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`Auth operation attempt ${attempt} failed:`, error);
      
      if (attempt === maxAttempts) {
        throw new AuthError(
          errorCode,
          `Operation failed after ${maxAttempts} attempts: ${error.message}`
        );
      }
      
      const delay = backoff ? delayMs * attempt : delayMs;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
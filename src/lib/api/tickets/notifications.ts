import { supabase } from '@/lib/supabase/client';
import { ApiError } from '@/lib/types/errors';

interface EmailNotification {
  id: string;
  ticket_id: string;
  recipient_email: string;
  subject: string;
  content: string;
  comment_id?: string;
  created_at: string;
  processed_at?: string;
  error?: string;
}

export async function getUnprocessedNotifications(): Promise<EmailNotification[]> {
  try {
    const { data, error } = await supabase
      .from('email_notifications')
      .select('*')
      .is('processed_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get notifications error:', error);
    throw new ApiError('FETCH_NOTIFICATIONS_FAILED', 'Failed to fetch notifications');
  }
}

export async function markNotificationProcessed(
  id: string,
  error?: string
): Promise<void> {
  try {
    const { error: updateError } = await supabase
      .from('email_notifications')
      .update({
        processed_at: new Date().toISOString(),
        error: error || null
      })
      .eq('id', id);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Update notification error:', error);
    throw new ApiError('UPDATE_NOTIFICATION_FAILED', 'Failed to update notification');
  }
}
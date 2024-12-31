import { getUnprocessedNotifications, markNotificationProcessed } from './notifications';
import { sendEmail } from '@/lib/email/sender';

export async function processEmailNotifications(): Promise<void> {
  const notifications = await getUnprocessedNotifications();

  for (const notification of notifications) {
    try {
      await sendEmail({
        to: notification.recipient_email,
        subject: notification.subject,
        text: notification.content,
        replyTo: `ticket-${notification.ticket_id}@${process.env.VITE_EMAIL_DOMAIN}`,
        threadId: notification.ticket_id
      });

      await markNotificationProcessed(notification.id);
    } catch (error) {
      console.error('Process notification error:', error);
      await markNotificationProcessed(notification.id, error.message);
    }
  }
}
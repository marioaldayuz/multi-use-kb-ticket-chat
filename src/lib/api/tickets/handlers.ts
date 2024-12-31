import { parseIncomingEmail } from '@/lib/email/parser';
import { createTicketFromEmail, createCommentFromEmail } from './email';
import { ApiError } from '@/lib/types/errors';

export async function handleIncomingEmail(rawEmail: string): Promise<void> {
  try {
    const { from, subject, content, threadId } = parseIncomingEmail(rawEmail);

    if (threadId) {
      // This is a reply to an existing ticket
      await createCommentFromEmail(threadId, content, from);
    } else {
      // This is a new ticket
      await createTicketFromEmail({
        subject,
        content,
        senderEmail: from,
        threadId: undefined
      });
    }
  } catch (error) {
    console.error('Handle incoming email error:', error);
    throw new ApiError('EMAIL_PROCESSING_FAILED', 'Failed to process incoming email');
  }
}
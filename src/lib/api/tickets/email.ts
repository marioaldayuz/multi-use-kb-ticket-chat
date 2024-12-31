import { supabase } from '@/lib/supabase/client';
import type { Ticket, TicketComment } from '@/lib/types/tickets';
import { ApiError } from '@/lib/types/errors';

interface CreateTicketFromEmailData {
  subject: string;
  content: string;
  senderEmail: string;
  threadId?: string;
}

export async function createTicketFromEmail({
  subject,
  content,
  senderEmail,
  threadId
}: CreateTicketFromEmailData): Promise<Ticket> {
  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert([{
        title: subject,
        description: content,
        submitter_email: senderEmail,
        email_thread_id: threadId,
        status: 'open',
        priority: 'medium',
        category: 'email'
      }])
      .select()
      .single();

    if (error) throw error;
    return ticket;
  } catch (error) {
    console.error('Create ticket from email error:', error);
    throw new ApiError('CREATE_TICKET_FAILED', 'Failed to create ticket from email');
  }
}

export async function createCommentFromEmail(
  ticketId: string,
  content: string,
  senderEmail: string
): Promise<TicketComment> {
  try {
    // Verify sender has access to ticket
    const { data: ticket } = await supabase
      .from('tickets')
      .select('submitter_email')
      .eq('id', ticketId)
      .single();

    if (!ticket || ticket.submitter_email !== senderEmail) {
      throw new Error('Unauthorized');
    }

    const { data: comment, error } = await supabase
      .from('ticket_comments')
      .insert([{
        ticket_id: ticketId,
        content,
        is_from_email: true,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return comment;
  } catch (error) {
    console.error('Create comment from email error:', error);
    throw new ApiError('CREATE_COMMENT_FAILED', 'Failed to create comment from email');
  }
}
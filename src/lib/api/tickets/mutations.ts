import { supabase } from '@/lib/supabase/client';
import type { Ticket } from '@/lib/types/tickets';
import { ApiError } from '@/lib/types/errors';

interface CreateTicketData {
  title: string;
  description: string;
  category: string;
  priority: Ticket['priority'];
  submitterEmail?: string;
}

export async function createTicket(data: CreateTicketData): Promise<Ticket> {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert([{
        ...data,
        user_id: user.id,
        submitter_email: data.submitterEmail || user.email,
        status: 'open'
      }])
      .select()
      .single();

    if (error) throw error;
    if (!ticket) throw new Error('Failed to create ticket');

    return ticket;
  } catch (error) {
    console.error('Create ticket error:', error);
    throw error instanceof ApiError ? error : new ApiError('CREATE_TICKET_FAILED', 'Failed to create ticket');
  }
}
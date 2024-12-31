import { supabase } from '@/lib/supabase/client';
import type { Ticket } from '@/lib/types/tickets';
import { ApiError } from '@/lib/types/errors';

export async function fetchTickets(): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch tickets error:', error);
    throw error instanceof ApiError ? error : new ApiError('FETCH_TICKETS_FAILED', 'Failed to fetch tickets');
  }
}

export async function fetchTicket(id: string): Promise<Ticket> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new ApiError('TICKET_NOT_FOUND', 'Ticket not found');

    return data;
  } catch (error) {
    console.error('Fetch ticket error:', error);
    throw error instanceof ApiError ? error : new ApiError('FETCH_TICKET_FAILED', 'Failed to fetch ticket');
  }
}

export async function updateTicketStatus(
  id: string,
  status: Ticket['status']
): Promise<void> {
  try {
    const { error } = await supabase
      .from('tickets')
      .update({ 
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Update ticket status error:', error);
    throw error instanceof ApiError ? error : new ApiError('UPDATE_TICKET_FAILED', 'Failed to update ticket status');
  }
}
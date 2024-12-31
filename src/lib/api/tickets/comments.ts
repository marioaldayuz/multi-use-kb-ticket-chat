import { supabase } from '@/lib/supabase/client';
import type { TicketComment } from '@/lib/types/tickets';
import { ApiError } from '@/lib/types/errors';

export async function createComment(
  ticketId: string,
  content: string,
  isInternal: boolean = false
): Promise<TicketComment> {
  const { data: comment, error } = await supabase
    .from('ticket_comments')
    .insert([{
      ticket_id: ticketId,
      content,
      is_internal: isInternal,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (error) throw new ApiError('CREATE_COMMENT_FAILED', error.message);
  if (!comment) throw new ApiError('CREATE_COMMENT_FAILED', 'Failed to create comment');

  return comment;
}

export async function fetchComments(ticketId: string): Promise<TicketComment[]> {
  const { data, error } = await supabase
    .from('ticket_comments')
    .select(`
      *,
      user:users(id, email, full_name)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) throw new ApiError('FETCH_COMMENTS_FAILED', error.message);
  return data || [];
}
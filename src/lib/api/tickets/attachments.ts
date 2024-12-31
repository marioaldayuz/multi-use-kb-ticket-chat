import { supabase } from '@/lib/supabase/client';
import type { TicketAttachment } from '@/lib/types/tickets';
import { ApiError } from '@/lib/types/errors';

export async function uploadAttachment(
  ticketId: string,
  file: File
): Promise<TicketAttachment> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new ApiError('UNAUTHORIZED', 'User not authenticated');

  // Upload file to storage
  const filePath = `tickets/${ticketId}/${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(filePath, file);

  if (uploadError) throw new ApiError('UPLOAD_FAILED', uploadError.message);

  // Create attachment record
  const { data: attachment, error: dbError } = await supabase
    .from('ticket_attachments')
    .insert([{
      ticket_id: ticketId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_path: filePath,
      uploaded_by: userId
    }])
    .select()
    .single();

  if (dbError) throw new ApiError('CREATE_ATTACHMENT_FAILED', dbError.message);
  if (!attachment) throw new ApiError('CREATE_ATTACHMENT_FAILED', 'Failed to create attachment');

  return attachment;
}

export async function fetchAttachments(ticketId: string): Promise<TicketAttachment[]> {
  const { data, error } = await supabase
    .from('ticket_attachments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError('FETCH_ATTACHMENTS_FAILED', error.message);
  return data || [];
}

export async function deleteAttachment(id: string): Promise<void> {
  const { error } = await supabase
    .from('ticket_attachments')
    .delete()
    .eq('id', id);

  if (error) throw new ApiError('DELETE_ATTACHMENT_FAILED', error.message);
}
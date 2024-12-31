// Update the existing types file to include new fields
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  user_id: string;
  assigned_to?: string;
  category: string;
  submitter_email: string;
  email_thread_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  is_from_email: boolean;
  created_at: string;
  user?: User;
}
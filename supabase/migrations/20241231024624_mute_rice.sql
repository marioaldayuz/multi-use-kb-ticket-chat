/*
  # Add email support for tickets
  
  1. Changes
    - Add email fields to tickets table
    - Add email notification system
    - Add email-based comment tracking
    
  2. Security
    - Enable RLS on notifications table
    - Add proper access policies
*/

-- Add the email fields to tickets first
ALTER TABLE tickets 
ADD COLUMN submitter_email text DEFAULT '',
ADD COLUMN email_thread_id text UNIQUE;

-- Update existing tickets with emails
UPDATE tickets t
SET submitter_email = u.email
FROM public.users u
WHERE t.user_id = u.id;

-- Now set NOT NULL constraint
ALTER TABLE tickets 
ALTER COLUMN submitter_email SET NOT NULL;

-- Add email source flag to comments
ALTER TABLE ticket_comments
ADD COLUMN is_from_email boolean DEFAULT false;

-- Create indexes for email lookups
CREATE INDEX idx_tickets_submitter_email ON tickets(submitter_email);
CREATE INDEX idx_tickets_email_thread_id ON tickets(email_thread_id);

-- Create email notifications queue table
CREATE TABLE email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  comment_id uuid REFERENCES ticket_comments(id),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  error text
);

-- Create function to notify on new comments
CREATE OR REPLACE FUNCTION notify_ticket_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue email notification
  INSERT INTO email_notifications (
    ticket_id,
    recipient_email,
    subject,
    content,
    comment_id
  )
  SELECT
    NEW.ticket_id,
    t.submitter_email,
    'Re: ' || t.title,
    NEW.content,
    NEW.id
  FROM tickets t
  WHERE t.id = NEW.ticket_id
  AND NOT NEW.is_from_email; -- Don't notify on email-sourced comments
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment notifications
CREATE TRIGGER notify_on_ticket_comment
  AFTER INSERT ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_comment();

-- Add indexes for notification processing
CREATE INDEX idx_email_notifications_unprocessed 
  ON email_notifications(processed_at) 
  WHERE processed_at IS NULL;

-- Enable RLS on email notifications
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Enable notification access for ticket owners"
  ON email_notifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
      AND (t.user_id = auth.uid() OR t.assigned_to = auth.uid())
    )
  );

-- Update ticket policies to allow email-based access
CREATE POLICY "Enable ticket access via email"
  ON tickets FOR SELECT
  TO public
  USING (submitter_email = current_setting('request.jwt.claims')::json->>'email');
/*
  # Fix ticket comments relationship and policies

  1. Changes
    - Add foreign key relationship between ticket_comments and users
    - Add policy for reading ticket comments
    - Add policy for managing ticket comments
    
  2. Security
    - Enable RLS
    - Add policies for proper access control
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view comments on their tickets" ON ticket_comments;
DROP POLICY IF EXISTS "Users can add comments to their tickets" ON ticket_comments;

-- Ensure proper foreign key relationship
ALTER TABLE ticket_comments
DROP CONSTRAINT IF EXISTS ticket_comments_user_id_fkey,
ADD CONSTRAINT ticket_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create improved policies
CREATE POLICY "Enable reading ticket comments"
  ON ticket_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
      AND (t.user_id = auth.uid() OR t.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Enable managing ticket comments"
  ON ticket_comments FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
      AND (t.user_id = auth.uid() OR t.assigned_to = auth.uid())
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id 
  ON ticket_comments(user_id);
/*
  # Fix users and ticket comments relationship

  1. Changes
    - Create public users table that mirrors auth.users
    - Update ticket_comments foreign key to reference public.users
    - Add trigger to sync auth.users with public.users
    
  2. Security
    - Enable RLS on all tables
    - Add proper access policies
*/

-- Create public users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Enable read access to authenticated users"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Update ticket_comments to reference public.users
ALTER TABLE ticket_comments
DROP CONSTRAINT IF EXISTS ticket_comments_user_id_fkey,
ADD CONSTRAINT ticket_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

-- Create function to handle user creation/updates
CREATE OR REPLACE FUNCTION handle_auth_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.users
    SET 
      email = NEW.email,
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', public.users.full_name)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for auth.users changes
DROP TRIGGER IF EXISTS on_auth_user_changes ON auth.users;
CREATE TRIGGER on_auth_user_changes
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_changes();

-- Recreate ticket comments policies
DROP POLICY IF EXISTS "Enable reading ticket comments" ON ticket_comments;
DROP POLICY IF EXISTS "Enable managing ticket comments" ON ticket_comments;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id ON ticket_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
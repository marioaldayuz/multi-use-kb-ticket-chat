/*
  # Reset and Simplify Database Schema
  
  1. Changes
    - Drop all existing tables and start fresh
    - Create simplified users table
    - Add proper indexes
    - Set up basic RLS policies
    - Create simple user creation trigger
*/

-- Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.auth_logs CASCADE;
DROP TABLE IF EXISTS public.user_creation_status CASCADE;

-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- Create auth_logs table for debugging
CREATE TABLE public.auth_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  error text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX idx_auth_logs_created_at ON auth_logs(created_at);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Enable read access for authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for service role only"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Enable update for users based on email"
  ON users FOR UPDATE
  TO authenticated
  USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');

-- Create simple user creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(
      NULLIF(EXCLUDED.full_name, ''),
      users.full_name
    );
    
  -- Log success
  INSERT INTO auth_logs (
    event_type,
    user_id,
    metadata
  ) VALUES (
    'user_created',
    NEW.id,
    jsonb_build_object('email', NEW.email)
  );
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail
  INSERT INTO auth_logs (
    event_type,
    user_id,
    error,
    metadata
  ) VALUES (
    'user_creation_error',
    NEW.id,
    SQLERRM,
    jsonb_build_object(
      'email', NEW.email,
      'error_detail', SQLSTATE
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
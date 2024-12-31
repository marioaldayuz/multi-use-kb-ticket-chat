/*
  # Fix Authentication Flow

  1. Changes
    - Simplify user creation trigger
    - Fix RLS policies
    - Add better error handling
    - Add proper indexes
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create simplified user creation function
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

-- Drop existing policies
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create simplified policies
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
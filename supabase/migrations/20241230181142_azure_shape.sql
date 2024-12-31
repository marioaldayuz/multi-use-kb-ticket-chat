/*
  # Fix Authentication Flow

  1. Changes
    - Add retry mechanism to user creation trigger
    - Add error logging table
    - Improve user creation trigger with better error handling
  
  2. Security
    - Maintain existing RLS policies
    - Add logging for debugging auth issues
*/

-- Create auth_logs table for debugging
CREATE TABLE IF NOT EXISTS auth_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  error text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Improved user creation function with retry logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  max_retries constant int := 3;
  current_try int := 0;
  last_error text;
BEGIN
  LOOP
    BEGIN
      INSERT INTO public.users (id, email, full_name)
      VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', '')
      )
      ON CONFLICT (id) DO UPDATE
      SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name);

      -- Log successful creation
      INSERT INTO auth_logs (event_type, user_id, metadata)
      VALUES ('user_created', new.id, jsonb_build_object(
        'email', new.email,
        'attempt', current_try + 1
      ));
        
      RETURN new;
    EXCEPTION WHEN OTHERS THEN
      last_error := SQLERRM;
      current_try := current_try + 1;
      
      -- Log the error
      INSERT INTO auth_logs (event_type, user_id, error, metadata)
      VALUES ('user_creation_error', new.id, last_error, jsonb_build_object(
        'attempt', current_try,
        'email', new.email
      ));

      IF current_try >= max_retries THEN
        RAISE EXCEPTION 'Failed to create user after % attempts: %', max_retries, last_error;
      END IF;
      
      -- Wait for a short time before retrying
      PERFORM pg_sleep(0.5);
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
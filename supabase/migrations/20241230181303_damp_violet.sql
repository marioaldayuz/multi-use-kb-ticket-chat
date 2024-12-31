/*
  # Improve User Creation Tracking

  1. Changes
    - Add auth_logs table for tracking creation attempts
    - Add retry logic to user creation
    - Improve error handling and logging
  
  2. Security
    - Maintain existing RLS policies
    - Add audit logging for debugging
*/

-- Create auth_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  error text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add status tracking table without enum dependency
CREATE TABLE IF NOT EXISTS user_creation_status (
  user_id uuid PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  attempts integer DEFAULT 0,
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add status update function
CREATE OR REPLACE FUNCTION update_user_creation_status()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add status update trigger
DROP TRIGGER IF EXISTS update_user_creation_status_timestamp ON user_creation_status;
CREATE TRIGGER update_user_creation_status_timestamp
  BEFORE UPDATE ON user_creation_status
  FOR EACH ROW
  EXECUTE FUNCTION update_user_creation_status();

-- Improved user creation function with status tracking
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  max_retries constant int := 3;
  retry_delay constant float := 0.5;
  current_try int := 0;
  last_error text;
BEGIN
  -- Initialize status tracking
  INSERT INTO user_creation_status (user_id)
  VALUES (NEW.id);

  LOOP
    BEGIN
      -- Attempt user creation
      INSERT INTO public.users (id, email, full_name)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
      )
      ON CONFLICT (id) DO UPDATE
      SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name);

      -- Update status on success
      UPDATE user_creation_status
      SET 
        status = 'completed',
        attempts = current_try + 1
      WHERE user_id = NEW.id;

      -- Log success
      INSERT INTO auth_logs (event_type, user_id, metadata)
      VALUES (
        'user_created',
        NEW.id,
        jsonb_build_object(
          'email', NEW.email,
          'attempts', current_try + 1
        )
      );

      RETURN NEW;

    EXCEPTION WHEN OTHERS THEN
      last_error := SQLERRM;
      current_try := current_try + 1;

      -- Update status
      UPDATE user_creation_status
      SET 
        attempts = current_try,
        last_error = last_error,
        status = CASE 
          WHEN current_try >= max_retries THEN 'failed'
          ELSE 'pending'
        END
      WHERE user_id = NEW.id;

      -- Log error
      INSERT INTO auth_logs (event_type, user_id, error, metadata)
      VALUES (
        'user_creation_error',
        NEW.id,
        last_error,
        jsonb_build_object(
          'attempt', current_try,
          'email', NEW.email
        )
      );

      IF current_try >= max_retries THEN
        RAISE EXCEPTION 'Failed to create user after % attempts: %', max_retries, last_error;
      END IF;

      PERFORM pg_sleep(retry_delay * current_try);
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
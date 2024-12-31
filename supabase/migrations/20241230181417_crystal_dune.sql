/*
  # Fix Authentication Flow

  1. Changes
    - Add trigger to handle auth.users changes
    - Add function to sync auth and public users
    - Add better error handling and logging
    - Add indexes for performance
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_creation_status_user_id ON user_creation_status(user_id);

-- Improve user creation function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  max_retries constant int := 3;
  retry_delay constant float := 0.5;
  current_try int := 0;
  last_error text;
BEGIN
  -- Initialize status tracking
  INSERT INTO user_creation_status (user_id, status)
  VALUES (NEW.id, 'pending')
  ON CONFLICT (user_id) DO UPDATE
  SET 
    status = 'pending',
    attempts = 0,
    last_error = NULL;

  LOOP
    BEGIN
      -- Attempt user creation/update
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

      -- Update status on success
      UPDATE user_creation_status
      SET 
        status = 'completed',
        attempts = current_try + 1,
        last_error = NULL,
        updated_at = now()
      WHERE user_id = NEW.id;

      -- Log success
      INSERT INTO auth_logs (
        event_type,
        user_id,
        metadata
      ) VALUES (
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
        END,
        updated_at = now()
      WHERE user_id = NEW.id;

      -- Log error
      INSERT INTO auth_logs (
        event_type,
        user_id,
        error,
        metadata
      ) VALUES (
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

-- Recreate trigger with better timing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add cleanup function for old logs
CREATE OR REPLACE FUNCTION cleanup_old_auth_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_logs
  WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;
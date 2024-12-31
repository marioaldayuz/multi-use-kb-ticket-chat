/*
  # Fix User Table RLS Policies

  1. Changes
    - Drop existing policies
    - Add policy for unauthenticated users to insert during signup
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data

  2. Security
    - Ensures users can only access their own data
    - Allows initial user creation during signup
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Allow user creation during signup (no auth check needed)
CREATE POLICY "Allow user creation during signup"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
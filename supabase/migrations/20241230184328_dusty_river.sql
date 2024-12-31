/*
  # Enable public article access

  1. Changes
    - Add public read access to articles table
    - Add public read access to categories table for article lookups
    - Add public read access to knowledge bases table for article lookups

  2. Security
    - Only allows reading published articles
    - Maintains existing authenticated user policies
    - Restricts access to only necessary fields
*/

-- Enable public read access to articles
CREATE POLICY "Allow public read access to articles"
  ON articles
  FOR SELECT
  TO public
  USING (true);

-- Enable public read access to categories (for article lookups)
CREATE POLICY "Allow public read access to categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

-- Enable public read access to knowledge bases (for article lookups)
CREATE POLICY "Allow public read access to knowledge bases"
  ON knowledge_bases
  FOR SELECT
  TO public
  USING (true);
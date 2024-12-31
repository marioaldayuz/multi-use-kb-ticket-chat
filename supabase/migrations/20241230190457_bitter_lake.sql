-- Drop existing policies
DROP POLICY IF EXISTS "Users can CRUD own articles" ON articles;
DROP POLICY IF EXISTS "Enable public article access" ON articles;

-- Create new policies with proper permissions
CREATE POLICY "Users can manage own articles"
  ON articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM categories c
      JOIN knowledge_bases kb ON kb.id = c.knowledge_base_id
      WHERE c.id = category_id 
      AND kb.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read articles"
  ON articles
  FOR SELECT
  TO public
  USING (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
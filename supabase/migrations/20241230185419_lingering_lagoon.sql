-- Enable public read access to articles with proper policies
CREATE POLICY "Enable public article access"
  ON articles
  FOR SELECT 
  TO public
  USING (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_id ON articles(id);
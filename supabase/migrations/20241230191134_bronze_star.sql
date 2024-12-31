-- Ensure proper public access to articles and related tables
CREATE POLICY "Public can read all articles"
  ON articles
  FOR SELECT
  TO public
  USING (true);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_articles_updated_at ON articles(updated_at);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);

-- Update the articles table to ensure proper triggers
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
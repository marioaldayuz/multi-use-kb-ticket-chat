-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_articles_id ON articles(id);
CREATE INDEX IF NOT EXISTS idx_categories_id ON categories(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_id ON knowledge_bases(id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable public article access" ON articles;
DROP POLICY IF EXISTS "Enable public category access" ON categories;
DROP POLICY IF EXISTS "Enable public knowledge base access" ON knowledge_bases;

-- Create new policies for public access
CREATE POLICY "Enable public article access"
  ON articles
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Enable public category access"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable public knowledge base access"
  ON knowledge_bases
  FOR SELECT
  TO public
  USING (true);
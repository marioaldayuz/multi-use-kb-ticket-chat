/*
  # Add article search and tags functionality

  1. New Tables
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `knowledge_base_id` (uuid, references knowledge_bases)
      - `created_at` (timestamptz)
    
    - `article_tags`
      - `article_id` (uuid, references articles)
      - `tag_id` (uuid, references tags)
      - Primary key (article_id, tag_id)

  2. Changes
    - Add full-text search to articles table
    - Add tags relation

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Create tags table
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  knowledge_base_id uuid REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, knowledge_base_id)
);

-- Create article_tags junction table
CREATE TABLE article_tags (
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Add full-text search to articles
ALTER TABLE articles ADD COLUMN search_vector tsvector 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) STORED;

-- Create search index
CREATE INDEX articles_search_idx ON articles USING GIN (search_vector);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags
CREATE POLICY "Allow authenticated users to manage tags"
  ON tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_bases kb
      WHERE kb.id = knowledge_base_id
      AND kb.user_id = auth.uid()
    )
  );

-- Create policies for article_tags
CREATE POLICY "Allow authenticated users to manage article tags"
  ON article_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles a
      JOIN categories c ON c.id = a.category_id
      JOIN knowledge_bases kb ON kb.id = c.knowledge_base_id
      WHERE a.id = article_id
      AND kb.user_id = auth.uid()
    )
  );

-- Allow public to read tags
CREATE POLICY "Allow public to read tags"
  ON tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to read article tags"
  ON article_tags
  FOR SELECT
  TO public
  USING (true);
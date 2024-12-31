import { supabase } from '@/lib/supabase/client';
import type { Article } from '@/lib/types';
import { ApiError } from '@/lib/types/errors';

export async function fetchPublicArticle(id: string): Promise<Article> {
  if (!id) throw new ApiError('INVALID_ID', 'Article ID is required');

  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      description,
      content,
      created_at,
      updated_at,
      category:categories (
        id,
        title,
        knowledge_base:knowledge_bases (
          id,
          name,
          domain
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fetch public article error:', error);
    throw new ApiError('FETCH_ARTICLE_FAILED', error.message);
  }

  if (!data) {
    throw new ApiError('ARTICLE_NOT_FOUND', 'Article not found');
  }

  console.log('Article data:', data);
  return data;
}
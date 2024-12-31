import { supabase } from '@/lib/supabase/client';
import type { Article } from '@/lib/types';
import { ApiError } from '@/lib/types/errors';

export async function getPublicArticle(id: string): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      description,
      content,
      category:categories(
        knowledge_base:knowledge_bases(
          domain
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new ApiError('FETCH_ARTICLE_FAILED', error.message);
  }
  if (!data) {
    throw new ApiError('ARTICLE_NOT_FOUND', 'Article not found');
  }

  return data;
}
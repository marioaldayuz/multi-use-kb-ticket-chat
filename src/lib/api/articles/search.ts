import { supabase } from '@/lib/supabase/client';
import type { Article } from '@/lib/types';
import { ApiError } from '@/lib/types/errors';

export async function searchArticles(query: string, knowledgeBaseId: string): Promise<Article[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category!inner(
        knowledge_base_id
      )
    `)
    .eq('category.knowledge_base_id', knowledgeBaseId)
    .textSearch('search_vector', query)
    .limit(20);

  if (error) {
    throw new ApiError('SEARCH_FAILED', error.message);
  }

  return data || [];
}
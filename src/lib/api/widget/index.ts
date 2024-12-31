import { supabase } from '@/lib/supabase/client';
import type { Article, Category, KnowledgeBase } from '@/lib/types';
import { ApiError } from '@/lib/types/errors';

export async function fetchWidgetKnowledgeBase(id: string): Promise<KnowledgeBase> {
  const { data, error } = await supabase
    .from('knowledge_bases')
    .select(`
      id,
      name,
      description,
      categories (
        id,
        title,
        description,
        order_index
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Widget KB error:', error);
    throw new ApiError('FETCH_KB_FAILED', error.message);
  }

  if (!data) {
    throw new ApiError('KB_NOT_FOUND', 'Knowledge base not found');
  }

  return data;
}

export async function fetchWidgetArticles(categoryId: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, description')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Widget articles error:', error);
    throw new ApiError('FETCH_ARTICLES_FAILED', error.message);
  }

  return data || [];
}

export async function fetchWidgetArticle(id: string): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      description,
      content,
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
    console.error('Widget article error:', error);
    throw new ApiError('FETCH_ARTICLE_FAILED', error.message);
  }

  if (!data) {
    throw new ApiError('ARTICLE_NOT_FOUND', 'Article not found');
  }

  return data;
}
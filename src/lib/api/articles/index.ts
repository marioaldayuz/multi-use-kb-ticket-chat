import { supabase } from '@/lib/supabase/client';
import type { Article } from '@/lib/types';
import { ApiError } from '@/lib/types/errors';

interface CreateArticleData {
  title: string;
  description: string | null;
  content: string | null;
  category_id: string;
}

interface UpdateArticleData {
  title?: string;
  description?: string | null;
  content?: string | null;
}

export async function createArticle(data: CreateArticleData): Promise<Article> {
  const { data: article, error } = await supabase
    .from('articles')
    .insert([{
      ...data,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      content: data.content?.trim() || null
    }])
    .select('*')
    .single();

  if (error) {
    console.error('Create article error:', error);
    throw new ApiError('CREATE_ARTICLE_FAILED', error.message);
  }

  return article;
}

export async function updateArticle(id: string, data: UpdateArticleData): Promise<Article> {
  const { data: article, error } = await supabase
    .from('articles')
    .update({
      ...data,
      title: data.title?.trim(),
      description: data.description?.trim() || null,
      content: data.content?.trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Update article error:', error);
    throw new ApiError('UPDATE_ARTICLE_FAILED', error.message);
  }

  return article;
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete article error:', error);
    throw new ApiError('DELETE_ARTICLE_FAILED', error.message);
  }
}

export async function fetchArticle(id: string): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(
        id,
        title,
        knowledge_base:knowledge_bases(
          id,
          name,
          domain
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fetch article error:', error);
    throw new ApiError('FETCH_ARTICLE_FAILED', error.message);
  }

  return data;
}

export async function fetchArticles(categoryId: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch articles error:', error);
    throw new ApiError('FETCH_ARTICLES_FAILED', error.message);
  }

  return data || [];
}
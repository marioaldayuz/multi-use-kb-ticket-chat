import { supabase } from '@/lib/supabase/client';
import type { Tag } from '@/lib/types';
import { ApiError } from '@/lib/types/errors';

export async function createTag(name: string, knowledgeBaseId: string): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name, knowledge_base_id: knowledgeBaseId }])
    .select()
    .single();

  if (error) {
    throw new ApiError('CREATE_TAG_FAILED', error.message);
  }

  return data;
}

export async function fetchTags(knowledgeBaseId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('knowledge_base_id', knowledgeBaseId)
    .order('name');

  if (error) {
    throw new ApiError('FETCH_TAGS_FAILED', error.message);
  }

  return data || [];
}

export async function addTagToArticle(articleId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('article_tags')
    .insert([{ article_id: articleId, tag_id: tagId }]);

  if (error) {
    throw new ApiError('ADD_TAG_FAILED', error.message);
  }
}

export async function removeTagFromArticle(articleId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('article_tags')
    .delete()
    .eq('article_id', articleId)
    .eq('tag_id', tagId);

  if (error) {
    throw new ApiError('REMOVE_TAG_FAILED', error.message);
  }
}

export async function getArticleTags(articleId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*, article_tags!inner(*)')
    .eq('article_tags.article_id', articleId)
    .order('name');

  if (error) {
    throw new ApiError('FETCH_ARTICLE_TAGS_FAILED', error.message);
  }

  return data || [];
}
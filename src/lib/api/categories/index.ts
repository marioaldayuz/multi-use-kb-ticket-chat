import { supabase } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';
import { ApiError } from '@/lib/types/errors';

interface CreateCategoryData {
  title: string;
  description: string | null;
  knowledge_base_id: string;
  order_index: number;
}

export async function createCategory(data: CreateCategoryData): Promise<Category> {
  const { data: category, error } = await supabase
    .from('categories')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new ApiError('CREATE_CATEGORY_FAILED', error.message);
  }
  if (!category) {
    throw new ApiError('CREATE_CATEGORY_FAILED', 'Failed to create category');
  }

  return category;
}

export async function fetchCategories(knowledgeBaseId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('knowledge_base_id', knowledgeBaseId)
    .order('order_index');

  if (error) {
    throw new ApiError('FETCH_CATEGORIES_FAILED', error.message);
  }

  return data || [];
}
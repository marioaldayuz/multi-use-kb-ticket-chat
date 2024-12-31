import { supabase } from '@/lib/supabase/client';
import type { KnowledgeBase } from '@/lib/types';
import { ApiError } from '@/lib/types/errors';

interface CreateKnowledgeBaseData {
  name: string;
  description: string | null;
  domain: string | null;
  user_id: string;
}

export async function createKnowledgeBase(data: CreateKnowledgeBaseData): Promise<KnowledgeBase> {
  const { data: kb, error } = await supabase
    .from('knowledge_bases')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new ApiError('CREATE_KB_FAILED', error.message);
  }
  if (!kb) {
    throw new ApiError('CREATE_KB_FAILED', 'Failed to create knowledge base');
  }

  return kb;
}
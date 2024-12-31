export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  user_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  title: string;
  description?: string;
  knowledge_base_id: string;
  order_index: number;
  created_at: string;
  knowledge_base?: KnowledgeBase;
}

export interface Article {
  id: string;
  title: string;
  description?: string;
  content: string;
  category_id: string;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  knowledge_base_id: string;
  created_at: string;
}
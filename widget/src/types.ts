export interface KBWidgetConfig {
  theme: 'light' | 'dark';
  knowledgeBaseId: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface Article {
  id: string;
  title: string;
  description?: string;
  content: string;
  category_id: string;
}

export interface Category {
  id: string;
  title: string;
  description?: string;
  articles?: Article[];
}

export interface KnowledgeBase {
  id: string;
  name: string;
  categories: Category[];
}

declare global {
  interface Window {
    KBWidget?: any;
  }
}
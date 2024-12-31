import type { Article, Category, KnowledgeBase } from '../types';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchKnowledgeBase(id: string): Promise<KnowledgeBase> {
    const response = await fetch(`${this.baseUrl}/api/widget/kb/${id}`);
    if (!response.ok) throw new Error('Failed to load knowledge base');
    return response.json();
  }

  async fetchCategories(knowledgeBaseId: string): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/api/widget/categories/${knowledgeBaseId}`);
    if (!response.ok) throw new Error('Failed to load categories');
    return response.json();
  }

  async fetchArticles(categoryId: string): Promise<Article[]> {
    const response = await fetch(`${this.baseUrl}/api/widget/articles/${categoryId}`);
    if (!response.ok) throw new Error('Failed to load articles');
    return response.json();
  }

  async fetchArticle(id: string): Promise<Article> {
    const response = await fetch(`${this.baseUrl}/api/widget/article/${id}`);
    if (!response.ok) throw new Error('Failed to load article');
    return response.json();
  }
}
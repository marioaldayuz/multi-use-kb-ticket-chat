import type { Article, Category, KnowledgeBase } from './types';

export async function fetchKnowledgeBase(baseUrl: string, id: string): Promise<KnowledgeBase> {
  const response = await fetch(`${baseUrl}/api/widget/kb/${id}`);
  if (!response.ok) throw new Error('Failed to load knowledge base');
  return response.json();
}

export async function fetchCategories(baseUrl: string, knowledgeBaseId: string): Promise<Category[]> {
  const response = await fetch(`${baseUrl}/api/widget/categories/${knowledgeBaseId}`);
  if (!response.ok) throw new Error('Failed to load categories');
  return response.json();
}

export async function fetchArticles(baseUrl: string, categoryId: string): Promise<Article[]> {
  const response = await fetch(`${baseUrl}/api/widget/articles/${categoryId}`);
  if (!response.ok) throw new Error('Failed to load articles');
  return response.json();
}

export async function fetchArticle(baseUrl: string, articleId: string): Promise<Article> {
  const response = await fetch(`${baseUrl}/api/widget/article/${articleId}`);
  if (!response.ok) throw new Error('Failed to load article');
  return response.json();
}

// Export to global scope
window.KBWidget = window.KBWidget || {};
window.KBWidget.api = {
  fetchKnowledgeBase,
  fetchCategories,
  fetchArticles,
  fetchArticle
};
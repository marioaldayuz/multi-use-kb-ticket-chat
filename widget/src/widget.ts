import { ApiClient } from './api/client';
import type { Article, Category, KnowledgeBase } from './types';

interface State {
  view: 'categories' | 'articles' | 'article';
  knowledgeBase: KnowledgeBase | null;
  articles: Article[];
  currentArticle: Article | null;
  currentCategoryId: string | null;
  isOpen: boolean;
  position: { x: number; y: number };
}

export class KBWidget {
  private container: HTMLElement;
  private api: ApiClient;
  private state: State;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  constructor(container: HTMLElement, api: ApiClient) {
    this.container = container;
    this.api = api;
    
    this.state = {
      view: 'categories',
      knowledgeBase: null,
      articles: [],
      currentArticle: null,
      currentCategoryId: null,
      isOpen: false,
      position: { x: 20, y: 20 }
    };

    const knowledgeBaseId = container.getAttribute('data-knowledge-base');
    if (!knowledgeBaseId) {
      throw new Error('Knowledge base ID is required');
    }

    this.init(knowledgeBaseId);
    this.setupEventListeners();
  }

  private async init(knowledgeBaseId: string) {
    try {
      this.renderLoading();
      const knowledgeBase = await this.api.fetchKnowledgeBase(knowledgeBaseId);
      this.state.knowledgeBase = knowledgeBase;
      this.render();
    } catch (error) {
      console.error('Widget initialization error:', error);
      this.renderError('Failed to load knowledge base');
    }
  }

  private setupEventListeners() {
    // Implementation remains the same
  }

  private render() {
    // Implementation remains the same
  }

  private renderLoading() {
    this.container.innerHTML = `
      <div class="kb-widget-loading">
        <div class="kb-widget-loading-spinner"></div>
      </div>
    `;
  }

  private renderError(message: string) {
    this.container.innerHTML = `
      <div class="kb-widget-error">${message}</div>
    `;
  }
}
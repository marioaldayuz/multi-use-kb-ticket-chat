import { fetchWidgetKnowledgeBase, fetchWidgetArticles, fetchWidgetArticle } from './api';
import type { Article, Category, KnowledgeBase } from './types';
import { renderWidget, renderError, renderLoading } from './renderer';

interface KBWidgetConfig {
  theme: 'light' | 'dark';
  knowledgeBaseId: string;
}

interface State {
  view: 'categories' | 'articles' | 'article';
  knowledgeBase: KnowledgeBase | null;
  articles: Article[];
  currentArticle: Article | null;
  currentCategoryId: string | null;
  isOpen: boolean;
  position: { x: number; y: number };
}

class KBWidget {
  private container: HTMLElement;
  private config: KBWidgetConfig;
  private state: State;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.config = {
      theme: (container.getAttribute('data-theme') as 'light' | 'dark') || 'light',
      knowledgeBaseId: container.getAttribute('data-knowledge-base') || '',
    };

    this.state = {
      view: 'categories',
      knowledgeBase: null,
      articles: [],
      currentArticle: null,
      currentCategoryId: null,
      isOpen: false,
      position: { x: 20, y: 20 }
    };

    if (!this.config.knowledgeBaseId) {
      throw new Error('Knowledge base ID is required');
    }

    this.init();
    this.setupEventListeners();
  }

  private async init() {
    try {
      this.renderLoading();
      const knowledgeBase = await fetchWidgetKnowledgeBase(
        window.location.origin,
        this.config.knowledgeBaseId
      );
      this.state.knowledgeBase = knowledgeBase;
      this.render();
    } catch (error) {
      console.error('Widget initialization error:', error);
      this.renderError('Failed to load knowledge base');
    }
  }

  private setupEventListeners() {
    // Handle drag events
    const header = this.container.querySelector('.kb-widget-header');
    if (header) {
      header.addEventListener('mousedown', this.handleDragStart.bind(this));
      document.addEventListener('mousemove', this.handleDrag.bind(this));
      document.addEventListener('mouseup', this.handleDragEnd.bind(this));
    }

    // Handle navigation
    this.container.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('.kb-widget-toggle')) {
        this.toggleWidget();
      }
      
      if (target.closest('[data-category-id]')) {
        const categoryId = target.closest('[data-category-id]')?.getAttribute('data-category-id');
        if (categoryId) await this.showArticles(categoryId);
      }
      
      if (target.closest('[data-article-id]')) {
        const articleId = target.closest('[data-article-id]')?.getAttribute('data-article-id');
        if (articleId) await this.showArticle(articleId);
      }
      
      if (target.closest('.kb-widget-back')) {
        this.handleBack();
      }
    });
  }

  private handleDragStart(e: MouseEvent) {
    if (!e.target || !(e.target as Element).closest('.kb-widget-header')) return;
    
    this.isDragging = true;
    this.dragStartX = e.clientX - this.state.position.x;
    this.dragStartY = e.clientY - this.state.position.y;
    
    this.container.style.cursor = 'grabbing';
  }

  private handleDrag(e: MouseEvent) {
    if (!this.isDragging) return;

    e.preventDefault();
    
    this.state.position = {
      x: e.clientX - this.dragStartX,
      y: e.clientY - this.dragStartY
    };
    
    this.updatePosition();
  }

  private handleDragEnd() {
    this.isDragging = false;
    this.container.style.cursor = '';
  }

  private updatePosition() {
    const { x, y } = this.state.position;
    this.container.style.transform = `translate(${x}px, ${y}px)`;
  }

  private toggleWidget() {
    this.state.isOpen = !this.state.isOpen;
    this.render();
  }

  private async showArticles(categoryId: string) {
    try {
      this.renderLoading();
      const articles = await fetchWidgetArticles(window.location.origin, categoryId);
      this.state.articles = articles;
      this.state.view = 'articles';
      this.state.currentCategoryId = categoryId;
      this.render();
    } catch (error) {
      console.error('Failed to load articles:', error);
      this.renderError('Failed to load articles');
    }
  }

  private async showArticle(articleId: string) {
    try {
      this.renderLoading();
      const article = await fetchWidgetArticle(window.location.origin, articleId);
      this.state.currentArticle = article;
      this.state.view = 'article';
      this.render();
    } catch (error) {
      console.error('Failed to load article:', error);
      this.renderError('Failed to load article');
    }
  }

  private handleBack() {
    if (this.state.view === 'article') {
      this.state.view = 'articles';
      this.state.currentArticle = null;
    } else if (this.state.view === 'articles') {
      this.state.view = 'categories';
      this.state.articles = [];
      this.state.currentCategoryId = null;
    }
    this.render();
  }

  private render() {
    renderWidget(this.container, {
      config: this.config,
      state: this.state
    });
    this.updatePosition();
  }
}

// Export to global scope
window.KBWidget = window.KBWidget || {};
window.KBWidget.Widget = KBWidget;
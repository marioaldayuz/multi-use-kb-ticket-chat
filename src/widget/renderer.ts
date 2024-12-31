import { Article, Category, KnowledgeBase } from './types';

interface RenderState {
  config: {
    theme: 'light' | 'dark';
  };
  state: {
    knowledgeBase: KnowledgeBase | null;
    categories: Category[];
    articles: Article[];
    currentArticle: Article | null;
    view: 'categories' | 'articles' | 'article';
  };
}

export function renderWidget(container: HTMLElement, { config, state }: RenderState): void {
  const { theme } = config;
  const { view, knowledgeBase, categories, articles, currentArticle } = state;

  // Sanitize content to prevent XSS
  const sanitizeHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.innerHTML;
  };

  let content = '';

  // Header
  content += `
    <div class="kb-widget ${theme}">
      <div class="kb-widget-header">
        <h2 class="kb-widget-title">${knowledgeBase?.name || 'Knowledge Base'}</h2>
      </div>
  `;

  // Back button for nested views
  if (view !== 'categories') {
    content += `
      <button class="kb-widget-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
    `;
  }

  // Content based on current view
  if (view === 'categories') {
    content += renderCategories(categories);
  } else if (view === 'articles') {
    content += renderArticlesList(articles);
  } else if (view === 'article') {
    content += renderArticleContent(currentArticle);
  }

  content += '</div>';
  container.innerHTML = content;
}

function renderCategories(categories: Category[]): string {
  if (categories.length === 0) {
    return '<div class="kb-widget-empty">No categories available</div>';
  }

  return `
    <div class="kb-widget-categories">
      ${categories.map(category => `
        <div class="kb-widget-category" data-category-id="${category.id}">
          <h3 class="kb-widget-category-title">${category.title}</h3>
          ${category.description ? `
            <p class="kb-widget-category-description">${sanitizeHtml(category.description)}</p>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderArticlesList(articles: Article[]): string {
  if (articles.length === 0) {
    return '<div class="kb-widget-empty">No articles available</div>';
  }

  return `
    <div class="kb-widget-articles">
      ${articles.map(article => `
        <div class="kb-widget-article" data-article-id="${article.id}">
          <h3 class="kb-widget-article-title">${article.title}</h3>
          ${article.description ? `
            <p class="kb-widget-article-description">${sanitizeHtml(article.description)}</p>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderArticleContent(article: Article | null): string {
  if (!article) {
    return '<div class="kb-widget-error">Article not found</div>';
  }

  return `
    <div class="kb-widget-article-content">
      <div class="kb-widget-article-header">
        <h1 class="kb-widget-article-title">${article.title}</h1>
        <div class="kb-widget-article-actions">
          <a 
            href="/article/${article.id}" 
            target="_blank"
            class="kb-widget-external-link"
            title="Open in new tab"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
      ${article.description ? `
        <p class="kb-widget-article-description">${sanitizeHtml(article.description)}</p>
      ` : ''}
      <div class="kb-widget-article-body prose">
        ${sanitizeHtml(article.content || '')}
      </div>
    </div>
  `;
}

export function renderError(container: HTMLElement, message: string = 'An error occurred'): void {
  container.innerHTML = `
    <div class="kb-widget-error">
      ${message}
    </div>
  `;
}

export function renderLoading(container: HTMLElement): void {
  container.innerHTML = `
    <div class="kb-widget-loading">
      <div class="kb-widget-loading-spinner"></div>
      Loading...
    </div>
  `;
}

// Export to global scope
window.KBWidget = window.KBWidget || {};
window.KBWidget.renderer = {
  renderWidget,
  renderError,
  renderLoading
};
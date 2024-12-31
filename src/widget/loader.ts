// Widget loader script
(function() {
  // Configuration
  const config = {
    scriptId: 'kb-widget-loader',
    widgetSelector: '[data-kb-widget]',
    resources: {
      js: '/widget.js',
      css: '/widget.css'
    }
  };

  // Get base URL from current script
  function getBaseUrl() {
    const currentScript = document.currentScript as HTMLScriptElement;
    if (!currentScript) return window.location.origin;
    return new URL(currentScript.src).origin;
  }

  // Load required resources
  async function loadResources() {
    const baseUrl = getBaseUrl();

    // Load styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${baseUrl}${config.resources.css}`;
    document.head.appendChild(link);

    // Load widget script
    const script = document.createElement('script');
    script.src = `${baseUrl}${config.resources.js}`;
    script.async = true;

    // Initialize widgets after script loads
    script.onload = initializeWidgets;
    script.onerror = handleLoadError;

    document.head.appendChild(script);
  }

  // Initialize widgets
  function initializeWidgets() {
    const widgets = document.querySelectorAll(config.widgetSelector);
    widgets.forEach(container => {
      try {
        if (!(window as any).KBWidget) {
          throw new Error('Widget not loaded properly');
        }
        new (window as any).KBWidget(container as HTMLElement);
      } catch (error) {
        console.error('Widget initialization failed:', error);
        showError(container as HTMLElement, 'Failed to initialize widget');
      }
    });
  }

  // Error handling
  function handleLoadError() {
    const widgets = document.querySelectorAll(config.widgetSelector);
    widgets.forEach(container => {
      showError(container as HTMLElement, 'Failed to load widget resources');
    });
  }

  function showError(container: HTMLElement, message: string) {
    container.innerHTML = `
      <div style="
        padding: 1rem;
        color: #991b1b;
        background: #fee2e2;
        border-radius: 0.375rem;
        text-align: center;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        ${message}
      </div>
    `;
  }

  // Start loading
  loadResources().catch(error => {
    console.error('Failed to load widget resources:', error);
  });
})();
(function() {
  const config = {
    scriptId: 'kb-widget-loader',
    widgetSelector: '[data-kb-widget]',
    resources: {
      js: '/widget.js',
      css: '/widget.css'
    }
  };

  function getBaseUrl() {
    const currentScript = document.currentScript as HTMLScriptElement;
    return currentScript ? new URL(currentScript.src).origin : window.location.origin;
  }

  async function loadResources() {
    const baseUrl = getBaseUrl();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${baseUrl}${config.resources.css}`;
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = `${baseUrl}${config.resources.js}`;
    script.async = true;
    script.onload = initializeWidgets;
    document.head.appendChild(script);
  }

  function initializeWidgets() {
    document.querySelectorAll(config.widgetSelector).forEach(element => {
      if (window.KBWidget) {
        window.KBWidget.init(element as HTMLElement);
      }
    });
  }

  loadResources().catch(console.error);
})();
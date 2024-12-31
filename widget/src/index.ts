import { ApiClient } from './api/client';
import { KBWidget } from './widget';
import './styles.css';

// Export to global scope
window.KBWidget = {
  init: (element: HTMLElement) => new KBWidget(element, new ApiClient(window.location.origin))
};
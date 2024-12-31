import { KBWidgetConfig } from './types';

export function parseConfig(element: HTMLElement): KBWidgetConfig {
  return {
    theme: (element.getAttribute('data-theme') || 'light') as 'light' | 'dark',
    width: element.getAttribute('data-width') || '100%',
    height: element.getAttribute('data-height') || 'auto'
  };
}
import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from './ui/button';

interface WidgetLauncherProps {
  knowledgeBaseId: string;
}

export default function WidgetLauncher({ knowledgeBaseId }: WidgetLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && !isLoaded) {
      // Load widget script
      const origin = window.location.origin;
      const script = document.createElement('script');
      script.src = `${origin}/loader.js`;
      script.async = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = (e) => console.error('Failed to load widget script:', e);
      document.head.appendChild(script);

      // Load widget styles
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${origin}/widget.css`;
      document.head.appendChild(link);
    }
  }, [isOpen, isLoaded]);

  return (
    <>
      {/* Floating button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Widget container */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
          <div
            data-kb-widget="true"
            data-knowledge-base={knowledgeBaseId}
            data-theme="light"
            className="w-full h-full"
          />
        </div>
      )}
    </>
  );
}
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { APP_CONFIG } from '@/config/constants';

interface WidgetCodeViewerProps {
  knowledgeBaseId: string;
}

export default function WidgetCodeViewer({ knowledgeBaseId }: WidgetCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const widgetCode = `<!-- Knowledge Base Widget -->
<div 
  data-kb-widget 
  data-knowledge-base="${knowledgeBaseId}"
  data-theme="light"
></div>
<script src="https://${APP_CONFIG.domain}/loader.js" async></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Embed Widget Code</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-xs"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-1" />
          ) : (
            <Copy className="h-4 w-4 mr-1" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
        <code>{widgetCode}</code>
      </pre>
    </div>
  );
}
import { Layout, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="col-span-full">
      <div className="glass-card rounded-lg p-8 text-center">
        <Layout className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Create your first knowledge base
        </h3>
        <p className="text-gray-500 mb-6">
          Get started by creating a new knowledge base to organize your documentation.
        </p>
        <Button onClick={onCreateClick}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Knowledge Base
        </Button>
      </div>
    </div>
  );
}